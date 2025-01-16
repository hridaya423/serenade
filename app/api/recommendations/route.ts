/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
let spotifyTokenCache: { token: string; expires: number } | null = null;

async function getSpotifyToken() {
  if (spotifyTokenCache && Date.now() < spotifyTokenCache.expires) {
    return spotifyTokenCache.token;
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) return null;
    const data = await response.json();
  
    spotifyTokenCache = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in * 1000) - 60000
    };
    
    return data.access_token;
  } catch {
    return null;
  }
}

async function searchSpotify(token: string, title: string, artist: string) {
  try {
    const query = `track:${title} artist:${artist}`;
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(2000)
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const track = data.tracks?.items?.[0];
    
    if (!track) return null;

    return {
      source: 'spotify',
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      albumArt: track.album.images,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      album: {
        name: track.album.name,
        releaseDate: track.album.release_date,
        totalTracks: track.album.total_tracks,
      }
    };
  } catch {
    return null;
  }
}

async function getRecommendationsWithTimeout(prompt: string) {
  return Promise.race([
    anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 650,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Claude API timeout')), 5000)
    )
  ]);
}

function createFallbackRecommendation(rec: any) {
  return {
    ...rec,
    id: Math.random().toString(36).substr(2, 9),
    albumArt: [{
      url: ``,
      height: 300,
      width: 300
    }],
    previewUrl: null,
    externalUrl: null,
    source: 'none'
  };
}

export async function POST(request: Request) {
  try {
    const { mood, genre, songName } = await request.json();
    const spotifyTokenPromise = getSpotifyToken();
    const promptParts = [];
    const constraints = [];

    if (mood) {
      promptParts.push(`mood ${mood.name}`);
      constraints.push(
        `danceability: ${mood.features.danceability}, energy: ${mood.features.energy}, valence: ${mood.features.valence}`
      );
    }
    if (genre) promptParts.push(`genre ${genre}`);
    if (songName) promptParts.push(`similar to "${songName}"`);

    const prompt = `You are a music recommendation system. Give exactly 5 popular, well-known song recommendations that match: ${promptParts.join(' and ')}.
    ${constraints.length > 0 ? `Musical qualities: ${constraints.join(', ')}.` : ''}
    Respond ONLY with this JSON format:
    {
      "recommendations": [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "year": "2024",
          "genre": ["Genre1"],
          "description": "Brief description",
          "mood_tags": ["mood1"],
          "tempo_range": "medium",
          "vibe": "energetic"
        }
      ]
    }`;
    let recommendations;
    try {
      const response = await getRecommendationsWithTimeout(prompt);
      if (typeof response !== 'object' || response === null || !('content' in response)) {
        throw new Error('Invalid response format');
      }
      const responseText = (response as any).content[0].type === 'text' ? (response as any).content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format');
      
      const parsed = JSON.parse(jsonMatch[0].replace(/[\u201C\u201D]/g, '"'));
      recommendations = parsed.recommendations || [];
    } catch (error) {
      return NextResponse.json({ 
        recommendations: [],
        error: 'Recommendation service temporarily unavailable'
      }, { status: 200 });
    }
    const spotifyToken = await spotifyTokenPromise;
    const enhancedRecommendationsPromise = Promise.all(
      recommendations.map(async (rec: any) => {
        if (!spotifyToken) return createFallbackRecommendation(rec);

        try {
          const musicServiceData = await searchSpotify(spotifyToken, rec.title, rec.artist);
          if (musicServiceData) return { ...rec, ...musicServiceData };
        } catch {}

        return createFallbackRecommendation(rec);
      })
    );
    const enhancedRecommendations = await Promise.race([
      enhancedRecommendationsPromise,
      new Promise((resolve) => {
        setTimeout(() => resolve(recommendations.map(createFallbackRecommendation)), 4000);
      })
    ]) as any[];

    return NextResponse.json(
      { recommendations: enhancedRecommendations },
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ 
      recommendations: [],
      error: 'Service temporarily unavailable'
    }, { status: 200 });
  }
}

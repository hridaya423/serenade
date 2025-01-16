/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

let spotifyTokenCache = {
  token: '',
  expiresAt: 0
};

async function getSpotifyToken() {
  const now = Date.now();
  if (spotifyTokenCache.token && now < spotifyTokenCache.expiresAt) {
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
        'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) return null;

    const data = await response.json();
    spotifyTokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in * 1000) - 60000
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
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    const track = data.tracks?.items?.[0];
    
    return track ? {
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
    } : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { mood, genre, songName } = await request.json();
    
    if (!mood && !genre && !songName) {
      throw new Error('Please provide at least one search criteria');
    }

    const promptParts = [
      mood && `mood ${mood.name}`,
      genre && `genre ${genre}`,
      songName && `similar to "${songName}"`
    ].filter(Boolean);

    const constraints = mood ? 
      [`danceability: ${mood.features.danceability}, energy: ${mood.features.energy}, valence: ${mood.features.valence}`] : 
      [];

    const prompt = `You are a music recommendation system. Generate exactly 5 song recommendations that match the following criteria: ${promptParts.join(' and ')}.
    ${constraints.length ? `The songs should match these musical qualities: ${constraints.join(', ')}.` : ''}
    IMPORTANT: Please suggest real, existing songs that are likely to be found on music streaming services.
    Respond ONLY with a JSON object in this exact format, with no additional text or explanation:
    {
      "recommendations": [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "year": "2024",
          "genre": ["Genre1", "Genre2"],
          "description": "Brief description",
          "mood_tags": ["mood1", "mood2"],
          "tempo_range": "slow/medium/fast",
          "vibe": "chill/energetic/etc"
        }
      ]
    }`;

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 650,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse recommendations');
    }
    
    const recommendations = JSON.parse(
      jsonMatch[0].replace(/[\u201C\u201D]/g, '"')
    ).recommendations;

    if (!recommendations?.length) {
      throw new Error('No recommendations found');
    }
    const spotifyToken = await getSpotifyToken();

    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        try {
          if (spotifyToken) {
            const musicData = await searchSpotify(spotifyToken, rec.title, rec.artist);
            if (musicData) {
              return { ...rec, ...musicData };
            }
          }
          return {
            ...rec,
            id: Math.random().toString(36).substring(2, 9),
            albumArt: [{
              url: '',
              height: 300,
              width: 300
            }],
            previewUrl: null,
            externalUrl: null,
            source: 'none'
          };
        } catch {
          return {
            ...rec,
            id: Math.random().toString(36).substring(2, 9),
            albumArt: [{
              url: '',
              height: 300,
              width: 300
            }],
            previewUrl: null,
            externalUrl: null,
            source: 'none'
          };
        }
      })
    );

    return NextResponse.json({ recommendations: enhancedRecommendations });
    
  } catch (error) {
    console.error('Error:', error);
    
    return NextResponse.json({
      error: 'Failed to get recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

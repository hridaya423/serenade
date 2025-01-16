/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function getSpotifyToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) return null;
    const data = await response.json();
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
        signal: AbortSignal.timeout(3000)
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

function isValidRecommendation(rec: any): boolean {
  return (
    typeof rec.title === 'string' &&
    typeof rec.artist === 'string' &&
    typeof rec.year === 'string' &&
    Array.isArray(rec.genre) &&
    typeof rec.description === 'string' &&
    Array.isArray(rec.mood_tags) &&
    typeof rec.tempo_range === 'string' &&
    typeof rec.vibe === 'string'
  );
}

function parseAndValidateResponse(jsonString: string) {
  try {
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const cleanJson = jsonMatch[0].replace(/[\u201C\u201D]/g, '"');
    const parsed = JSON.parse(cleanJson);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid format');
    }

    const validRecommendations = parsed.recommendations.filter(isValidRecommendation);
    if (validRecommendations.length === 0) throw new Error('No valid recommendations');

    return validRecommendations;
  } catch (error) {
    throw new Error('Failed to parse recommendations');
  }
}

async function getRecommendations(prompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 650,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch {
    throw new Error('Failed to get recommendations');
  }
}

export async function POST(request: Request) {
  try {
    const { mood, genre, songName } = await request.json();
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

    const prompt = `You are a music recommendation system. Generate exactly 5 song recommendations that match the following criteria: ${promptParts.join(' and ')}.
    ${constraints.length > 0 ? `The songs should match these musical qualities: ${constraints.join(', ')}.` : ''}
    IMPORTANT: Please suggest real, existing songs that are likely to be found on music streaming services.

    Respond ONLY with a JSON object in this exact format, with no additional text:
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
    const responseText = await getRecommendations(prompt);
    const recommendations = parseAndValidateResponse(responseText);
    const spotifyToken = await getSpotifyToken();
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        let musicServiceData = null;
        
        if (spotifyToken) {
          musicServiceData = await searchSpotify(spotifyToken, rec.title, rec.artist);
        }
        
        if (musicServiceData) {
          return { ...rec, ...musicServiceData };
        }
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
      })
    );

    return NextResponse.json(
      { recommendations: enhancedRecommendations },
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = (error as any)?.status || 500;
    
    return NextResponse.json({
      error: 'Failed to get recommendations',
      details: errorMessage,
      status: statusCode
    }, { status: statusCode });
  }
}

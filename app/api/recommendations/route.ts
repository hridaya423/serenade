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
    throw new Error('Missing Spotify credentials');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${await response.text()}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.warn('Spotify token error:', error);
    return null;
  }
}

async function searchSpotify(token: string, title: string, artist: string) {
  try {
    const query = `track:${title} artist:${artist}`;
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${await response.text()}`);
    }

    const data = await response.json();
    const track = data.tracks?.items?.[0];
    
    if (!track) {
      return null;
    }

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
  } catch (error) {
    console.warn('Spotify search error:', error);
    return null;
  }
}

async function searchDeezer(title: string, artist: string) {
  try {
    const query = `${title} ${artist}`;
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Deezer search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const track = data.data?.[0];

    if (!track) {
      return null;
    }

    return {
      source: 'deezer',
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      albumArt: [
        {
          url: track.album.cover_xl || track.album.cover_big || track.album.cover,
          height: 500,
          width: 500
        }
      ],
      previewUrl: track.preview,
      externalUrl: track.link,
      album: {
        name: track.album.title,
        releaseDate: null,
        totalTracks: null
      }
    };
  } catch (error) {
    console.warn('Deezer search error:', error);
    return null;
  }
}

async function searchLastFm(title: string, artist: string) {
  const apiKey = process.env.LASTFM_API_KEY;
  
  if (!apiKey) {
    console.warn('Missing Last.fm API key');
    return null;
  }

  try {
    const query = `track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=${query}`
    );

    if (!response.ok) {
      throw new Error(`Last.fm search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const track = data.track;

    if (!track) {
      return null;
    }

    return {
      source: 'lastfm',
      id: null,
      title: track.name,
      artist: track.artist.name,
      albumArt: track.album?.image ? [
        {
          url: track.album.image.find((img: any) => img.size === 'extralarge')?.['#text'] ||
               track.album.image.find((img: any) => img.size === 'large')?.['#text'],
          height: 300,
          width: 300
        }
      ] : null,
      previewUrl: null,
      externalUrl: track.url,
      album: {
        name: track.album?.title || null,
        releaseDate: null,
        totalTracks: null
      }
    };
  } catch (error) {
    console.warn('Last.fm search error:', error);
    return null;
  }
}

async function findTrackAcrossServices(title: string, artist: string) {
  const spotifyToken = await getSpotifyToken();
  if (spotifyToken) {
    const spotifyResult = await searchSpotify(spotifyToken, title, artist);
    if (spotifyResult) return spotifyResult;
  }
  const deezerResult = await searchDeezer(title, artist);
  if (deezerResult) return deezerResult;

  const lastFmResult = await searchLastFm(title, artist);
  if (lastFmResult) return lastFmResult;

  return null;
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
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const cleanJson = jsonMatch[0].replace(/[\u201C\u201D]/g, '"');
    const parsed = JSON.parse(cleanJson);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid recommendations format');
    }

    const validRecommendations = parsed.recommendations.filter(isValidRecommendation);

    if (validRecommendations.length === 0) {
      throw new Error('No valid recommendations found');
    }

    return validRecommendations;
  } catch (error) {
    console.error('JSON parsing error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to parse recommendations: ${error.message}`);
    } else {
      throw new Error('Failed to parse recommendations: Unknown error');
    }
  }
}

async function getRecommendationsWithRetry(prompt: string, maxRetries = 3, initialDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 650,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error: any) {
      const isOverloaded = error.status === 529;
      const isRateLimited = error.status === 429;
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      if (!isOverloaded && !isRateLimited) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
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
    if (genre) {
      promptParts.push(`genre ${genre}`);
    }
    if (songName) {
      promptParts.push(`similar to "${songName}"`);
    }

    const prompt = `You are a music recommendation system. Generate exactly 5 song recommendations that match the following criteria: ${promptParts.join(' and ')}.
    ${constraints.length > 0 ? `The songs should match these musical qualities: ${constraints.join(', ')}.` : ''}
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

    const responseText = await getRecommendationsWithRetry(prompt);
    const recommendations = parseAndValidateResponse(responseText);

    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        const musicServiceData = await findTrackAcrossServices(rec.title, rec.artist);
        
        if (musicServiceData) {
          return {
            ...rec,
            ...musicServiceData
          };
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
    console.error('Error getting recommendations:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = (error as any)?.status || 500;
    const errorResponse = {
      error: 'Failed to get recommendations',
      details: errorMessage,
      status: statusCode,
      retry: statusCode === 529 ? 'Service is temporarily overloaded, please try again in a few moments' : undefined
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
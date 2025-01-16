/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

async function getSpotifyToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

async function fetchSpotifyData(endpoint: string, token: string) {
  try {
    const response = await fetch(`${SPOTIFY_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify API error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorData
      });
      
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

function transformAlbumData(item: any) {
  if (!item || typeof item !== 'object') return null;
  
  try {
    return {
      id: item.id || `album-${Math.random()}`,
      name: item.name || 'Unknown Album',
      artists: Array.isArray(item.artists) ? item.artists : [],
      images: Array.isArray(item.images) ? item.images : [],
      external_urls: item.external_urls || { spotify: '#' },
      release_date: item.release_date || null,
      type: item.type || 'album'
    };
  } catch (error) {
    console.error('Error transforming album data:', error);
    return null;
  }
}

async function fetchFeaturedPlaylists(token: string) {
  const data = await fetchSpotifyData(
    '/browse/featured-playlists?limit=6&country=US',
    token
  );
  
  if (!data?.playlists?.items) {
    return [];
  }

  return data.playlists.items.map((playlist: any) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || 'Featured Spotify playlist',
    images: playlist.images || [],
    external_urls: playlist.external_urls || { spotify: '#' },
  })).filter(Boolean);
}

export async function GET() {
  try {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error('Spotify credentials not configured');
    }

    const token = await getSpotifyToken();
    
    const [newReleasesData, featuredPlaylists] = await Promise.all([
      fetchSpotifyData('/browse/new-releases?limit=20&country=US', token),
      fetchFeaturedPlaylists(token)
    ]);

    const newReleases = (newReleasesData?.albums?.items || [])
      .map(transformAlbumData)
      .filter(Boolean);

    if (!newReleases.length && !featuredPlaylists.length) {
      throw new Error('No music content available');
    }

    return NextResponse.json({
      newReleases,
      featuredPlaylists,
      _meta: {
        totalNewReleases: newReleases.length,
        totalPlaylists: featuredPlaylists.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in Spotify API route:', error);
    
    const errorResponse = {
      error: error.message || 'Failed to fetch music data',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      } : undefined,
      code: error.name === 'TypeError' ? 'NETWORK_ERROR' : 'API_ERROR'
    };

    return NextResponse.json(errorResponse, { 
      status: error.status || 500,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      }
    });
  }
}
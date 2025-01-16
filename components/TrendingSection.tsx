import React, { useState, useEffect } from 'react';
import { Music, Disc, Loader2, Sparkles, Album, AlertCircle } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createRoot } from 'react-dom/client';

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyExternalUrls {
  spotify: string;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
  artists: SpotifyArtist[];
}

interface MusicData {
  featuredPlaylists: SpotifyPlaylist[];
  newReleases: SpotifyAlbum[];
}

const FallbackImage: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-blue-400/20 to-green-400/20 flex items-center justify-center">
    <Music className="w-8 h-8 text-blue-400/50" />
  </div>
);

const MusicFeatured: React.FC = () => {
  const [data, setData] = useState<MusicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWithRetry = async (retries = 3): Promise<boolean> => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch('/api/music');
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
          }
          
          if (result.error) {
            throw new Error(result.error);
          }
          
          setData(result);
          setError(null);
          return true;
        } catch (err) {
          console.error(`Attempt ${i + 1} failed:`, err);
          if (i === retries - 1) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      return false;
    };

    const loadData = async () => {
      setLoading(true);
      try {
        await fetchWithRetry();
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      setData(null);
      setError(null);
      setLoading(false);
    };
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.currentTarget;
    target.style.display = 'none';
    
    if (target.parentElement) {
      const fallbackContainer = document.createElement('div');
      fallbackContainer.className = "w-full h-full";
      target.parentElement.appendChild(fallbackContainer);
      const root = createRoot(fallbackContainer);
      root.render(<FallbackImage />);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-blue-600 animate-pulse font-medium">Finding the perfect tunes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.featuredPlaylists?.length && !data?.newReleases?.length) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          No music content available at the moment. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-12">
      {data.featuredPlaylists?.length > 0 && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-green-400/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <Disc className="w-8 h-8 text-blue-500 animate-spin-slow" />
                <Sparkles className="w-4 h-4 text-green-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Featured Playlists
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Curated collections for your moment
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.featuredPlaylists.map((playlist) => (
                <a
                  key={playlist.id}
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 p-6 transition-all duration-300 group-hover:scale-[1.02] border border-blue-100/50 shadow-lg hover:shadow-blue-200/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-green-400/0 group-hover:from-blue-400/10 group-hover:to-green-400/10 transition-all duration-500" />
                    <div className="relative flex gap-6">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={playlist.images[0]?.url || ''}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                          {playlist.name}
                        </h3>
                        <p className="text-slate-600 line-clamp-2 mt-2 text-sm">
                          {playlist.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {data.newReleases?.length > 0 && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <Album className="w-8 h-8 text-green-500" />
                <Sparkles className="w-4 h-4 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  New Releases
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Fresh tracks and albums just dropped
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {data.newReleases.map((album) => (
                <a
                  key={album.id}
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-green-50 transition-all duration-300 group-hover:scale-[1.02] border border-green-100/50 shadow-lg hover:shadow-green-200/50">
                    <div className="relative aspect-square">
                      <img
                        src={album.images[0]?.url || ''}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm truncate bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {album.name}
                      </h3>
                      <p className="text-slate-600 truncate mt-1 text-sm">
                        {album.artists[0]?.name}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MusicFeatured;
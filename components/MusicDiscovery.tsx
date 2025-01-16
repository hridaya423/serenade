import React, { useState } from 'react';
import { Search, Music, Sparkles, Volume2, X, Play, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { moods, genreCategories } from '@/lib/consts';

type MoodFeatures = {
  danceability: number;
  energy: number;
  valence: number;
  instrumentalness: number;
  acousticness: number;
  speechiness: number;
  tempo?: number;
  loudness?: number;
};

type Mood = {
  name: string;
  emoji: string;
  color: string;
  features: MoodFeatures;
  description?: string;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  year: string | number;
  description?: string;
  genre?: string | string[];
  features?: Partial<MoodFeatures>;
  duration?: number;
  bpm?: number;
  key?: string;
  popularity?: number;
  preview_url?: string;
  external_urls?: {
    spotify?: string;
    youtube?: string;
  };
};

const FallbackImage = () => (
  <div className="w-full h-full bg-gradient-to-br from-blue-400/20 to-green-400/20 flex items-center justify-center rounded-lg">
    <Music className="w-8 h-8 text-blue-400/50" />
  </div>
);

interface SongImageProps {
  src: string;
  alt: string;
  className?: string;
}

const SongImage: React.FC<SongImageProps> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={className}>
        <FallbackImage />
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
};

type CriteriaType = 'mood' | 'genre' | 'similar';
const MusicDiscovery: React.FC = () => {
  const [activeCriteria, setActiveCriteria] = useState<Set<CriteriaType>>(new Set(['mood']));
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCriteria = (criteria: CriteriaType) => {
    const newCriteria = new Set(activeCriteria);
    if (newCriteria.has(criteria)) {
      newCriteria.delete(criteria);
      if (criteria === 'mood') setSelectedMood(null);
      if (criteria === 'genre') setSelectedGenre(null);
      if (criteria === 'similar') setSearchQuery('');
    } else {
      newCriteria.add(criteria);
    }
    setActiveCriteria(newCriteria);
  };

  const handleSearch = async () => {
    if (!selectedMood && !selectedGenre && !searchQuery) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          genre: selectedGenre,
          songName: searchQuery || null
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const criteriaButtons = [
    { id: 'mood' as const, label: 'By Mood', icon: Volume2 },
    { id: 'genre' as const, label: 'By Genre', icon: Music },
    { id: 'similar' as const, label: 'Similar Songs', icon: Search },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 p-1.5 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl shadow-lg">
        {criteriaButtons.map((tab) => (
          <button
            key={tab.id}
            onClick={() => toggleCriteria(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 flex-1 justify-center ${
              activeCriteria.has(tab.id)
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-[1.02]'
                : 'bg-white text-slate-600 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeCriteria.has('mood') && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <Volume2 className="w-5 h-5 text-teal-500" />
              How are you feeling today?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood)}
                  className={`group relative p-6 rounded-2xl flex flex-col items-center transition-all duration-300 hover:scale-105 
                    ${selectedMood?.name === mood.name 
                      ? 'ring-2 ring-blue-400 shadow-lg' 
                      : 'hover:shadow-xl bg-white'
                    }`}
                >
                  <div className={`absolute inset-0 rounded-2xl opacity-20 ${mood.color}`}></div>
                  <div className="relative">
                    <span className="text-4xl mb-4 block transform transition-transform duration-300 group-hover:scale-110">
                      {mood.emoji}
                    </span>
                    <span className="font-medium text-slate-700">{mood.name}</span>
                    {mood.description && (
                      <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {mood.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {activeCriteria.has('genre') && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <Music className="w-5 h-5 text-blue-500" />
              Pick your vibe
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {genreCategories.map((category) => (
                <button
                  key={category.main}
                  onClick={() => setSelectedGenre(category.main)}
                  className={`group relative p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                    selectedGenre === category.main
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white hover:shadow-xl border border-slate-100'
                  }`}
                >
                  <div className="font-medium">{category.main}</div>
                  {category.subgenres.length > 0 && (
                    <p className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                      {category.subgenres.slice(0, 2).join(', ')}
                      {category.subgenres.length > 2 && '...'}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {activeCriteria.has('similar') && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <Search className="w-5 h-5 text-teal-500" />
              Find similar tracks
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a song name..."
                className="w-full px-6 py-4 bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 pl-12 shadow-sm"
              />
              <Search className="absolute left-4 top-4 text-slate-400" size={20} />
            </div>
          </div>
        )}
      </div>
      {(selectedMood || selectedGenre || searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {selectedMood && (
            <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              {selectedMood.emoji} {selectedMood.name}
              <button 
                onClick={() => setSelectedMood(null)}
                className="hover:text-blue-800 p-1 hover:bg-blue-200/50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {selectedGenre && (
            <span className="bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <Music className="w-4 h-4" />
              {selectedGenre}
              <button 
                onClick={() => setSelectedGenre(null)}
                className="hover:text-teal-800 p-1 hover:bg-teal-200/50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <Search className="w-4 h-4" />
              {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="hover:text-slate-800 p-1 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
      )}
      <button
        onClick={handleSearch}
        disabled={loading || (!selectedMood && !selectedGenre && !searchQuery)}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 font-medium shadow-lg disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Curating your perfect mix...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Discover Music
          </span>
        )}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Your Personalized Mix
          </h3>
          <div className="grid gap-4">
            {recommendations.map((song) => (
              <div
                key={song.id}
                className="group relative bg-white rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-center gap-6">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <SongImage
                      src={song.albumArt}
                      alt={song.title}
                      className="w-full h-full shadow-md group-hover:shadow-xl transition-all duration-300"
                    />
                    <button 
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center"
                      onClick={() => window.open(song.preview_url, '_blank')}
                      disabled={!song.preview_url}
                    >
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-slate-500">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {song.year}
                        </span>
                        {song.external_urls?.spotify && (
                          <button 
                            onClick={() => window.open(song.external_urls?.spotify, '_blank')}
                            className="p-2 rounded-full hover:bg-white/60 text-slate-400 hover:text-blue-500 transition-colors"
                            aria-label="Open in Spotify"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {song.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {song.description}
                      </p>
                    )}
                    {song.genre && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(Array.isArray(song.genre) ? song.genre : [song.genre]).map((g: string) => (
                          <span 
                            key={g} 
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                    {song.features && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        {song.bpm && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {song.bpm} BPM
                          </span>
                        )}
                        {song.key && (
                          <span>Key: {song.key}</span>
                        )}
                        {song.duration && (
                          <span>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicDiscovery;
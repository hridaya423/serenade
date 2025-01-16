
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

export type Mood = {
  name: string;
  emoji: string;
  color: string;
  features: MoodFeatures;
  description?: string;
};

export const moods: Mood[] = [
  {
    name: 'Happy',
    emoji: '😊',
    color: 'bg-yellow-500',
    description: 'Upbeat and cheerful tunes to brighten your day',
    features: {
      danceability: 0.8,
      energy: 0.7,
      valence: 0.9,
      instrumentalness: 0.3,
      acousticness: 0.4,
      speechiness: 0.2,
      tempo: 120,
      loudness: -6
    }
  },
  {
    name: 'Energetic',
    emoji: '⚡',
    color: 'bg-red-500',
    description: 'High-energy tracks to get you moving',
    features: {
      danceability: 0.9,
      energy: 0.9,
      valence: 0.7,
      instrumentalness: 0.2,
      acousticness: 0.3,
      speechiness: 0.4,
      tempo: 140,
      loudness: -4
    }
  },
  {
    name: 'Relaxed',
    emoji: '😌',
    color: 'bg-blue-500',
    description: 'Calm and soothing melodies for unwinding',
    features: {
      danceability: 0.3,
      energy: 0.2,
      valence: 0.6,
      instrumentalness: 0.6,
      acousticness: 0.8,
      speechiness: 0.1,
      tempo: 85,
      loudness: -12
    }
  },
  {
    name: 'Melancholic',
    emoji: '😢',
    color: 'bg-purple-500',
    description: 'Emotional and reflective songs for deep feelings',
    features: {
      danceability: 0.4,
      energy: 0.3,
      valence: 0.2,
      instrumentalness: 0.5,
      acousticness: 0.7,
      speechiness: 0.2,
      tempo: 95,
      loudness: -10
    }
  },
  {
    name: 'Focused',
    emoji: '🎯',
    color: 'bg-green-500',
    description: 'Concentration-enhancing tracks for productivity',
    features: {
      danceability: 0.4,
      energy: 0.5,
      valence: 0.6,
      instrumentalness: 0.8,
      acousticness: 0.6,
      speechiness: 0.1,
      tempo: 110,
      loudness: -14
    }
  },
  {
    name: 'Romantic',
    emoji: '💝',
    color: 'bg-pink-500',
    description: 'Love songs and romantic melodies',
    features: {
      danceability: 0.5,
      energy: 0.4,
      valence: 0.7,
      instrumentalness: 0.3,
      acousticness: 0.6,
      speechiness: 0.3,
      tempo: 100,
      loudness: -8
    }
  },
  {
    name: 'Party',
    emoji: '🎉',
    color: 'bg-indigo-500',
    description: 'Upbeat party anthems to get the crowd going',
    features: {
      danceability: 0.9,
      energy: 0.8,
      valence: 0.8,
      instrumentalness: 0.1,
      acousticness: 0.2,
      speechiness: 0.4,
      tempo: 128,
      loudness: -5
    }
  },
  {
    name: 'Peaceful',
    emoji: '🌅',
    color: 'bg-teal-500',
    description: 'Serene and peaceful tracks for meditation',
    features: {
      danceability: 0.2,
      energy: 0.1,
      valence: 0.5,
      instrumentalness: 0.7,
      acousticness: 0.9,
      speechiness: 0.1,
      tempo: 75,
      loudness: -18
    }
  }
];

type GenreCategory = {
  main: string;
  subgenres: string[];
};

export const genreCategories: GenreCategory[] = [
  {
    main: 'Pop',
    subgenres: ['Synth-pop', 'K-pop', 'Art Pop', 'Indie Pop', 'Dream Pop']
  },
  {
    main: 'Rock',
    subgenres: ['Alternative', 'Classic Rock', 'Indie Rock', 'Punk Rock', 'Progressive Rock']
  },
  {
    main: 'Hip Hop',
    subgenres: ['Trap', 'Rap', 'Alternative Hip Hop', 'Lo-fi Hip Hop', 'Conscious Hip Hop']
  },
  {
    main: 'Electronic',
    subgenres: ['House', 'Techno', 'Ambient', 'Drum & Bass', 'Dubstep']
  },
  {
    main: 'R&B',
    subgenres: ['Soul', 'Contemporary R&B', 'Neo Soul', 'Alternative R&B']
  },
  {
    main: 'Jazz',
    subgenres: ['Bebop', 'Swing', 'Modern Jazz', 'Jazz Fusion', 'Cool Jazz']
  },
  {
    main: 'Classical',
    subgenres: ['Baroque', 'Romantic', 'Contemporary Classical', 'Minimalist', 'Opera']
  },
  {
    main: 'Country',
    subgenres: ['Modern Country', 'Bluegrass', 'Country Pop', 'Alternative Country']
  },
  {
    main: 'Folk',
    subgenres: ['Contemporary Folk', 'Traditional Folk', 'Folk Rock', 'Indie Folk']
  },
  {
    main: 'Metal',
    subgenres: ['Heavy Metal', 'Death Metal', 'Black Metal', 'Progressive Metal', 'Metalcore']
  },
  {
    main: 'Indie',
    subgenres: ['Indie Rock', 'Indie Pop', 'Indie Folk', 'Alternative Indie']
  },
  {
    main: 'Latin',
    subgenres: ['Reggaeton', 'Salsa', 'Latin Pop', 'Bachata', 'Latin Jazz']
  },
  {
    main: 'World',
    subgenres: ['African', 'Asian', 'Celtic', 'Caribbean', 'Middle Eastern']
  },
  {
    main: 'Blues',
    subgenres: ['Chicago Blues', 'Delta Blues', 'Electric Blues', 'Contemporary Blues']
  },
  {
    main: 'Reggae',
    subgenres: ['Roots Reggae', 'Dub', 'Dancehall', 'Ska']
  }
];

export const genres: string[] = genreCategories.map(category => category.main);

export const detailedGenres: string[] = genreCategories.reduce((acc, category) => {
  return [...acc, category.main, ...category.subgenres];
}, [] as string[]);

export type Song = {
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
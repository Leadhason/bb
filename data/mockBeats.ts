export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: "UK Drill" | "Trap" | "Hip Hop";
  tags: string[];
  coverColor: string; // Used for high-end styled CSS cover art
  coverUrl?: string;
  mp3Url: string; // High-quality royalty-free preview loop
  wavUrl: string;
  nonExclusiveEnabled: boolean;
  nonExclusivePrice: number;
  nonExclusiveCap?: number;
  exclusiveEnabled: boolean;
  exclusivePrice: number;
  exclusiveSold: boolean;
  published: boolean;
  nonExclusiveSold: number;
  createdAt: string;
}

export const MOCK_BEATS: Beat[] = [
  {
    id: "beat-1",
    title: "Ghost Town",
    bpm: 142,
    key: "A Minor",
    genre: "UK Drill",
    tags: ["Dark", "Aggressive", "Melodic"],
    coverColor: "from-zinc-900 to-black border-zinc-800",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 29.99,
    nonExclusiveCap: 50,
    exclusiveEnabled: true,
    exclusivePrice: 199.99,
    exclusiveSold: false,
    published: true,
    nonExclusiveSold: 12,
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "beat-2",
    title: "No Mercy",
    bpm: 140,
    key: "D# Minor",
    genre: "UK Drill",
    tags: ["Dark", "Aggressive", "Cinematic"],
    coverColor: "from-red-950/40 to-black border-red-950/50",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 34.99,
    nonExclusiveCap: 15,
    exclusiveEnabled: true,
    exclusivePrice: 249.99,
    exclusiveSold: false,
    published: true,
    nonExclusiveSold: 14, // Almost at cap (14/15 -> >= 80% warning badge!)
    createdAt: "2026-05-18T12:00:00Z",
  },
  {
    id: "beat-3",
    title: "Viper",
    bpm: 128,
    key: "G Minor",
    genre: "Trap",
    tags: ["Chill", "Melodic", "Dark"],
    coverColor: "from-emerald-950/40 to-black border-emerald-950/50",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 24.99,
    nonExclusiveCap: 100,
    exclusiveEnabled: true,
    exclusivePrice: 149.99,
    exclusiveSold: true, // EXCLUSIVE SOLD, should trigger opacity 0.45 and SOLD badges
    published: false,
    nonExclusiveSold: 8,
    createdAt: "2026-05-15T08:30:00Z",
  },
  {
    id: "beat-4",
    title: "Spitfire",
    bpm: 135,
    key: "C Minor",
    genre: "Trap",
    tags: ["Aggressive", "Chill", "Melodic"],
    coverColor: "from-amber-950/30 to-black border-amber-950/40",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 29.99,
    nonExclusiveCap: undefined,
    exclusiveEnabled: true,
    exclusivePrice: 189.99,
    exclusiveSold: false,
    published: true,
    nonExclusiveSold: 0,
    createdAt: "2026-05-12T15:00:00Z",
  },
  {
    id: "beat-5",
    title: "Sub Zero",
    bpm: 144,
    key: "F Minor",
    genre: "UK Drill",
    tags: ["Dark", "Cinematic", "Aggressive"],
    coverColor: "from-cyan-950/30 to-black border-cyan-950/40",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 39.99,
    nonExclusiveCap: 10,
    exclusiveEnabled: true,
    exclusivePrice: 299.99,
    exclusiveSold: false,
    published: true,
    nonExclusiveSold: 3,
    createdAt: "2026-05-09T09:15:00Z",
  },
  {
    id: "beat-6",
    title: "Overdrive",
    bpm: 130,
    key: "E Minor",
    genre: "Trap",
    tags: ["Aggressive", "Dark", "Melodic"],
    coverColor: "from-fuchsia-950/30 to-black border-fuchsia-950/40",
    mp3Url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    wavUrl: "#",
    nonExclusiveEnabled: true,
    nonExclusivePrice: 27.99,
    nonExclusiveCap: 30,
    exclusiveEnabled: true,
    exclusivePrice: 169.99,
    exclusiveSold: false,
    published: true,
    nonExclusiveSold: 21,
    createdAt: "2026-05-05T14:40:00Z",
  }
];

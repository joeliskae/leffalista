export type Movie = {
  id: string;
  title: string;
  watched: boolean;
  year?: string;
  rating?: string;
  poster?: string;
  plot?: string;
  created_at?: string;
  imdbID?: string;
  genre?: string;
  runtime?: string;
  director?: string;
  actors?: string;
};

export type StreamingService = {
  service: string;
  streamingType: string;
  link: string;
  videoQuality: string;
  audios: { language: string; region: string }[];
  subtitles: { language: string; region: string }[];
};

declare const __APP_VERSION__: string;
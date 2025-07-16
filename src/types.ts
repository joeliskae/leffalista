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
  yellow_heart?: boolean;
  pink_heart?: boolean;
};

export type StreamingService = {
  service: string;
  streamingType: string;
  link: string;
  videoQuality: string;
  audios: { language: string; region: string }[];
  subtitles: { language: string; region: string }[];
};

export type User = {
  id: string;
  name: string;
  heart_color: 'yellow' | 'pink';
  created_at?: string;
};

export interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void;
  onMessage: (channel: string, callback: (...args: any[]) => void) => void;
  storeData: (key: string, data: any) => Promise<{ success: boolean; error?: string }>;
  getStoredData: (key: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare const __APP_VERSION__: string;
import { streamingClient } from './config';
import { type StreamingService } from './types';

export const fetchStreamingData = async (imdbID: string): Promise<StreamingService[]> => {
  try {
    const data = await streamingClient.showsApi.getShow({
      id: imdbID,
      country: "fi",
    });

    const finlandStreaming = data.streamingOptions?.fi ?? [];
    
    const services = finlandStreaming.map((stream: any) => ({
      service: stream.service?.name || stream.service?.id || "Tuntematon",
      streamingType: stream.type,
      link: stream.link,
      videoQuality: stream.quality,
      audios: stream.audios || [],
      subtitles: stream.subtitles || [],
    }));

    return services;
  } catch (error) {
    console.error("Streaming data fetch failed:", error);
    return [];
  }
};

export const consolidateStreamingServices = (services: StreamingService[]) => {
  const qualityOrder = ["uhd", "hd", "sd"];
  
  return Object.values(
    services.reduce((acc, stream) => {
      const existing = acc[stream.service];
      
      // Pidä paras laatu
      if (
        !existing ||
        qualityOrder.indexOf(stream.videoQuality) < qualityOrder.indexOf(existing.videoQuality)
      ) {
        acc[stream.service] = stream;
      }
      
      return acc;
    }, {} as Record<string, StreamingService>)
  );
};
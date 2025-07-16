import { OMDB_API_KEY } from "./config";

// omdb.ts
export interface OMDBSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OMDBSearchResponse {
  Search: OMDBSearchResult[];
  totalResults: string;
  Response: string;
}

export const searchMovies = async (query: string): Promise<OMDBSearchResult[]> => {
  if (query.length < 3) return []; // Hae vasta kun on tarpeeksi kirjaimia
  
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`
    );
    
    const data: OMDBSearchResponse = await response.json();
    
    if (data.Response === "True") {
      return data.Search.slice(0, 5); // Rajoita 5 tulokseen
    }
    
    return [];
  } catch (error) {
    console.error("Movie search failed:", error);
    return [];
  }
};
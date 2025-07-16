import { type Movie } from './types';
import { OMDB_API_KEY, supabase } from './config';

export const fetchMovieData = async (title: string): Promise<Partial<Movie>> => {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`
    );
    const data = await res.json();
    if (data.Response === "True") {
      return {
        year: data.Year,
        rating: data.imdbRating,
        poster: data.Poster !== "N/A" ? data.Poster : undefined,
        plot: data.Plot,
        imdbID: data.imdbID,
        genre: data.Genre,
        runtime: data.Runtime,
        director: data.Director,
        actors: data.Actors,
      };
    }
  } catch (err) {
    console.error("OMDb fetch failed", err);
  }
  return {};
};

export const fetchMovieDataByImdbID = async (imdbID: string): Promise<Partial<Movie>> => {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`
    );
    const data = await res.json();
    
    if (data.Response === "True") {
      return {
        title: data.Title,
        year: data.Year,
        rating: data.imdbRating,
        poster: data.Poster !== "N/A" ? data.Poster : undefined,
        plot: data.Plot,
        imdbID: data.imdbID,
        genre: data.Genre,
        runtime: data.Runtime,
        director: data.Director,
        actors: data.Actors,
      };
    }
  } catch (err) {
    console.error("OMDb fetch by IMDb ID failed", err);
  }
  return {};
};

export const fetchMovies = async (): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
  return data || [];
};

export const addMovie = async (title: string): Promise<boolean> => {
  const extra = await fetchMovieData(title);
  
  const { error } = await supabase.from("movies").insert([
    {
      title,
      watched: false,
      ...extra,
    },
  ]);

  if (error) {
    console.error("Error adding movie:", error);
    return false;
  }
  return true;
};

export const toggleWatched = async (id: string, currentWatched: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from("movies")
    .update({ watched: !currentWatched })
    .eq("id", id);

  if (error) {
    console.error("Error updating movie:", error);
    return false;
  }
  return true;
};

export const removeMovie = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("movies").delete().eq("id", id);

  if (error) {
    console.error("Error deleting movie:", error);
    return false;
  }
  return true;
};

export const updateMovieByImdbID = async (movieId: string, imdbID: string): Promise<boolean> => {
  const movieData = await fetchMovieDataByImdbID(imdbID);
  
  if (!movieData.title) {
    return false;
  }

  const { error } = await supabase
    .from("movies")
    .update(movieData)
    .eq("id", movieId);

  if (error) {
    console.error("Error updating movie:", error);
    return false;
  }
  return true;
};


export const toggleHeart = async (
  movieId: string, 
  heartType: 'yellow' | 'pink', 
  newValue: boolean
): Promise<boolean> => {
  const columnName = heartType === 'yellow' ? 'yellow_heart' : 'pink_heart';
  
  const { error } = await supabase
    .from("movies")
    .update({ [columnName]: newValue })
    .eq("id", movieId);

  if (error) {
    console.error(`Error updating ${heartType} heart:`, error);
    return false;
  }
  
  console.log(`💖 ${heartType} sydän ${newValue ? 'lisätty' : 'poistettu'} leffallle ${movieId}`);
  return true;
};
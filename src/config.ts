import { createClient } from "@supabase/supabase-js";
import { Client, Configuration } from "streaming-availability";

export const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY!;
export const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY!;
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const streamingClient = new Client(new Configuration({ apiKey: RAPIDAPI_KEY }));
export const supabase = createClient(supabaseUrl, supabaseKey);
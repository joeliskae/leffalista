import React, { useState, useEffect } from "react";
import { type Movie, type User } from "./types";
import { supabase } from "./config";
import { 
  fetchMovies, 
  addMovie as addMovieAPI, 
  toggleWatched as toggleWatchedAPI, 
  removeMovie as removeMovieAPI,
  updateMovieByImdbID as updateMovieByImdbIDAPI,
  toggleHeart as toggleHeartAPI // Tämä pitää vielä luoda api.ts:ssä
} from "./api";
import { getRandomSlogan, pickRandomMovie, filterMovies } from "./utils";
import { MovieItem } from "./MovieItem";
import { MovieModal } from "./MovieModal";
import { Footer } from "./Footer";
import { UserSelection } from "./UserSelection"; // Tämä pitää vielä luoda
import "./App.css";
import { MovieSearchInput } from "./MovieSearchInput";
import { type OMDBSearchResult } from "./omdb";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [input, setInput] = useState("");
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlogan] = useState(getRandomSlogan());
  
  // Uudet käyttäjähallinta state:t
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserSelection, setShowUserSelection] = useState(false);

  useEffect(() => {
    checkSavedUser();
    loadMovies();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  // Tarkista onko käyttäjä jo valittu
  const checkSavedUser = async () => {
    try {
      if (window.electronAPI) {
        const savedUser = await window.electronAPI.getStoredData('currentUser');
        if (savedUser) {
          setCurrentUser(savedUser);
          console.log("👤 Käyttäjä ladattu:", savedUser);
        } else {
          console.log("👤 Ei tallennettua käyttäjää, näytetään valinta");
          setShowUserSelection(true);
        }
      }
    } catch (error) {
      console.error('❌ Virhe käyttäjätietojen lataamisessa:', error);
      setShowUserSelection(true);
    }
  };

  // Käyttäjän valinta
  const handleUserSelect = async (heartColor: 'yellow' | 'pink') => {
    const user: User = {
      id: crypto.randomUUID(),
      name: heartColor === 'yellow' ? 'Keltainen käyttäjä' : 'Pinkki käyttäjä',
      heart_color: heartColor,
      created_at: new Date().toISOString()
    };
    
    setCurrentUser(user);
    setShowUserSelection(false);
    
    console.log("👤 Käyttäjä valittu:", user);
    
    // Tallenna käyttäjä
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeData('currentUser', user);
        console.log("💾 Käyttäjä tallennettu");
      } catch (error) {
        console.error("❌ Käyttäjän tallennus epäonnistui:", error);
      }
    }
  };

  const loadMovies = async () => {
    try {
      const movieData = await fetchMovies();
      setMovies(movieData);
      console.log("🎬 Leffat ladattu:", movieData.length, "kpl");

      // Ilmoita pääprosessille että data on ladattu
      if (window.electronAPI) {
        try {
          console.log("📡 Lähetetään 'data-loaded' viestiä...");
          window.electronAPI.sendMessage("data-loaded", null);
          console.log("✅ 'data-loaded' viesti lähetetty");
        } catch (err) {
          console.error("❌ IPC-viesti epäonnistui:", err);
        }
      } else {
        console.warn("⚠️ window.electronAPI ei ole saatavilla (dev-mode?)");
      }
    } catch (error) {
      console.error("❌ Virhe ladattaessa leffoja:", error);
      
      // Lähetetään data-loaded vaikka lataus epäonnistui
      if (window.electronAPI) {
        try {
          window.electronAPI.sendMessage("data-loaded", null);
          console.log("✅ 'data-loaded' lähetetty virheen jälkeen");
        } catch (err) {
          console.error("❌ IPC-viesti epäonnistui virheen jälkeen:", err);
        }
      }
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("movies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "movies" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMovies((prev) => [payload.new as Movie, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setMovies((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? (payload.new as Movie) : m
              )
            );
            if (modalMovie && modalMovie.id === payload.new.id) {
              setModalMovie(payload.new as Movie);
            }
          } else if (payload.eventType === "DELETE") {
            setMovies((prev) => prev.filter((m) => m.id !== payload.old.id));
            if (modalMovie && modalMovie.id === payload.old.id) {
              setModalMovie(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddMovie = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const success = await addMovieAPI(input.trim());
    if (success) {
      setInput("");
    }
    setLoading(false);
  };

  const handleMovieSelect = async (movie: OMDBSearchResult) => {
    setLoading(true);
    const success = await addMovieAPI(movie.Title);
    setLoading(false);
  };

  const handleToggleWatched = async (id: string) => {
    const movie = movies.find((m) => m.id === id);
    if (!movie) return;

    await toggleWatchedAPI(id, movie.watched);
  };

  const handleRemoveMovie = async (id: string) => {
    await removeMovieAPI(id);
  };

  // Uusi sydän-äänestys
  const handleHeartToggle = async (movieId: string) => {
    if (!currentUser) return;
    
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;

    const heartType = currentUser.heart_color;
    const currentValue = heartType === 'yellow' ? movie.yellow_heart : movie.pink_heart;
    
    console.log(`💖 Vaihdetaan ${heartType} sydän leffallle:`, movie.title, "nykyarvo:", currentValue);
    
    await toggleHeartAPI(movieId, heartType, !currentValue);
  };

  const handlePickRandom = () => {
    const randomMovie = pickRandomMovie(movies);
    if (randomMovie) {
      setModalMovie(randomMovie);
    }
  };

  const handleUpdateMovieByImdbID = async (movieId: string, imdbID: string): Promise<boolean> => {
    const success = await updateMovieByImdbIDAPI(movieId, imdbID);
    return success;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isSearchMode) {
      setSearchQuery(value);
    } else {
      setInput(value);
    }
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    setSearchQuery("");
    setInput("");
  };

  const filteredMovies = isSearchMode && searchQuery.trim()
    ? filterMovies(movies, searchQuery)
    : movies;

  // Näytä käyttäjävalinta jos ei ole valittu
  if (showUserSelection) {
    return <UserSelection onUserSelect={handleUserSelect} />;
  }

  // Näytä loading jos käyttäjä ei ole vielä ladattu
  if (!currentUser) {
    return (
      <div className="body">
        <div className="container">
          <div style={{ textAlign: "center", color: "white", padding: "2rem" }}>
            <h2>Ladataan...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      <div className="container">
        <h1
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "2rem",
            fontSize: "2.5rem",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            minWidth: "500px",
            maxWidth: "500px",
          }}
        >
          {currentSlogan}
        </h1>
        
        <div className="controls">
          <div className="input-wrapper" style={{ position: "relative" }}>
            {!isSearchMode ? (
              <MovieSearchInput 
                onMovieSelect={handleMovieSelect}
                placeholder="Hae ja lisää leffa..."
                disabled={loading}
              />
            ) : (
              <input
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Haku..."
                style={{
                  backgroundColor: "#fce4ec",
                  borderColor: "#e91e63",
                  color: "#333",
                  paddingRight: "70px",
                }}
              />
            )}
            
            <div
              className="toggle-switch"
              onClick={toggleSearchMode}
              title={isSearchMode ? "Lisää leffa" : "Haku"}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "50px",
                height: "26px",
                backgroundColor: isSearchMode ? "#e91e63" : "#4caf50",
                borderRadius: "13px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                display: "flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  position: "absolute",
                  left: isSearchMode ? "26px" : "2px",
                  transition: "left 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {isSearchMode ? "🔍" : "➕"}
              </div>
            </div>
          </div>
          <button className="random-button" onClick={handlePickRandom}>
            🎲
          </button>
        </div>

        {isSearchMode && searchQuery.trim() && (
          <div
            style={{
              margin: "1rem 0",
              padding: "0.5rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "4px",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            Löytyi {filteredMovies.length} tulosta haulle "{searchQuery}"
          </div>
        )}

        <div className="movies-list">
          {filteredMovies.map((movie) => (
            <MovieItem
              key={movie.id}
              movie={movie}
              currentUser={currentUser}
              onTitleClick={setModalMovie}
              onToggleWatched={handleToggleWatched}
              onRemove={handleRemoveMovie}
              onHeartToggle={handleHeartToggle}
            />
          ))}
        </div>

        {modalMovie && (
          <MovieModal
            movie={modalMovie}
            onClose={() => setModalMovie(null)}
            onUpdateImdbID={handleUpdateMovieByImdbID}
          />
        )}
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
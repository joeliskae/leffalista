import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

type Movie = {
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

declare const __APP_VERSION__: string;

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY!;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function MovieItem({ movie, onTitleClick, onToggleWatched, onRemove }: {
  movie: Movie;
  onTitleClick: (movie: Movie) => void;
  onToggleWatched: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`movie-item ${movie.watched ? 'watched' : ''}`}>
      {movie.poster && <img src={movie.poster} alt="" className="poster" />}
      <div className="movie-title" onClick={() => onTitleClick(movie)}>
        {movie.title} {movie.year && `(${movie.year})`}
      </div>
      {movie.rating && (
        <div className="badge" onClick={() => onToggleWatched(movie.id)}>
          {movie.rating}
        </div>
      )}
      <div className="remove" onClick={() => onRemove(movie.id)}>X</div>
    </div>
  );
}

function MovieModal({ movie, onClose, onUpdateImdbID }: {
  movie: Movie;
  onClose: () => void;
  onUpdateImdbID: (movieId: string, imdbID: string) => Promise<void>;
}) {
  const [editMode, setEditMode] = useState(false);
  const [imdbInput, setImdbInput] = useState(movie.imdbID || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!imdbInput.trim()) {
      alert('Anna IMDb ID');
      return;
    }
    setLoading(true);
    try {
      await onUpdateImdbID(movie.id, imdbInput.trim());
      setEditMode(false);
    } catch {
      alert('Päivitys epäonnistui');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={backdropStyle}>
      <div className="modal" onClick={e => e.stopPropagation()} style={modalStyle}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              style={{ width: '180px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '180px', height: '270px', background: '#ccc', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'
            }}>
              Ei julistetta
            </div>
          )}

          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 0, marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, flexGrow: 1 }}>
                {movie.title} {movie.year && <span style={{ color: '#888' }}>({movie.year})</span>}
              </h2>
              {movie.rating && (
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'gold', marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {movie.rating} <span style={{ fontSize: '1.9rem', color: 'gold' }}>★</span>
                </span>
              )}
            </div>

            {movie.genre && <p><strong>Genre:</strong> {movie.genre}</p>}
            {movie.runtime && <p><strong>Kesto:</strong> {movie.runtime}</p>}
            {movie.director && <p><strong>Ohjaaja:</strong> {movie.director}</p>}
            {movie.actors && <p><strong>Näyttelijät:</strong> {movie.actors}</p>}

            <p><strong>Kuvaus:</strong> {movie.plot || 'Ei kuvausta'}</p>

            {editMode ? (
              <>
                <input
                  type="text"
                  placeholder="Anna IMDb ID, esim. tt0111161"
                  value={imdbInput}
                  onChange={e => setImdbInput(e.target.value)}
                  style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
                />
                <button onClick={handleSave} disabled={loading} style={{ marginRight: '0.5rem' }}>
                  {loading ? 'Tallennetaan...' : 'Tallenna'}
                </button>
                <button onClick={() => { setEditMode(false); setImdbInput(movie.imdbID || ''); }}>
                  Peruuta
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ marginTop: '1rem' }}>
                ✏️ Muokkaa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  maxWidth: '700px',
  padding: '1.5rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  maxHeight: '80vh',
  overflowY: 'auto',
};

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [input, setInput] = useState('');
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sloganit lista
  const slogans = [
    "Kaksi katsojaa, yksi tarina",
    "Yhteisiä hetkiä, parhaita leffoja",
    "Yksi lista, kaksi mielipidettä",
    "Kaksi päätä, yksi katsottu klassikko",
    "Leffa-algoritmi optimoitu kahdelle",
    "Ctrl + You + Me = Play",
    "Olipa kerran... Leffalista",
    "Tähtienvälistä viihdettä kahdelle",
    "Play. Pause. Snuggle",
    "Seitsemän ihmisten käyttöön. Yksi meille",
    
  ];
  
  const [currentSlogan] = useState(() => {
    return slogans[Math.floor(Math.random() * slogans.length)];
  });

  useEffect(() => {
    fetchMovies();

    const channel = supabase
      .channel('movies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMovies(prev => [payload.new as Movie, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMovies(prev => prev.map(m => m.id === payload.new.id ? payload.new as Movie : m));
          if (modalMovie && modalMovie.id === payload.new.id) {
            setModalMovie(payload.new as Movie);
          }
        } else if (payload.eventType === 'DELETE') {
          setMovies(prev => prev.filter(m => m.id !== payload.old.id));
          if (modalMovie && modalMovie.id === payload.old.id) {
            setModalMovie(null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [modalMovie]);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movies:', error);
    } else {
      setMovies(data || []);
    }
  };

  const fetchMovieData = async (title: string): Promise<Partial<Movie>> => {
    try {
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
      const data = await res.json();
      if (data.Response === 'True') {
        return {
          year: data.Year,
          rating: data.imdbRating,
          poster: data.Poster !== 'N/A' ? data.Poster : undefined,
          plot: data.Plot,
          imdbID: data.imdbID,
          genre: data.Genre,
          runtime: data.Runtime,
          director: data.Director,
          actors: data.Actors,
        };
      }
    } catch (err) {
      console.error('OMDb fetch failed', err);
    }
    return {};
  };

  const addMovie = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const title = input.trim();
    const extra = await fetchMovieData(title);

    const { error } = await supabase
      .from('movies')
      .insert([{
        title,
        watched: false,
        ...extra,
      }]);

    if (error) {
      console.error('Error adding movie:', error);
    } else {
      setInput('');
    }
    setLoading(false);
  };

  const toggleWatched = async (id: string) => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    const { error } = await supabase
      .from('movies')
      .update({ watched: !movie.watched })
      .eq('id', id);

    if (error) {
      console.error('Error updating movie:', error);
    }
  };

  const removeMovie = async (id: string) => {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const pickRandom = () => {
    const unwatched = movies.filter(m => !m.watched);
    if (unwatched.length === 0) return;
    const random = unwatched[Math.floor(Math.random() * unwatched.length)];
    setModalMovie(random);
  };

  const updateMovieByImdbID = async (movieId: string, imdbID: string) => {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
    const data = await res.json();

    if (data.Response === 'True') {
      const updateFields = {
        title: data.Title,
        year: data.Year,
        rating: data.imdbRating,
        poster: data.Poster !== 'N/A' ? data.Poster : undefined,
        plot: data.Plot,
        imdbID: data.imdbID,
        genre: data.Genre,
        runtime: data.Runtime,
        director: data.Director,
        actors: data.Actors,
      };

      const { error } = await supabase.from('movies').update(updateFields).eq('id', movieId);

      if (error) {
        alert('Virhe päivittäessä leffaa');
        console.error(error);
      }
    } else {
      alert('IMDb ID ei löytynyt');
    }
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
    setSearchQuery('');
    setInput('');
  };

  // Filtteröity lista
  const filteredMovies = isSearchMode && searchQuery.trim() 
    ? movies.filter(movie => {
        const query = searchQuery.toLowerCase();
        return (
          movie.title.toLowerCase().includes(query) ||
          movie.genre?.toLowerCase().includes(query) ||
          movie.director?.toLowerCase().includes(query) ||
          movie.actors?.toLowerCase().includes(query)
        );
      })
    : movies;

  function Footer() {
    return (
      <footer
        style={{
          marginTop: '2rem',
          padding: '1rem 0',
          textAlign: 'center',
          fontStyle: 'italic',
          color: 'white',
          fontSize: '0.9rem',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          borderRadius: '4px',
        }}
      >
        <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
          Passion for movies — bringing our watchlist to life!
          Made with love ❤️ by Lihis
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>Versio {__APP_VERSION__}</p>
      </footer>
    );
  }

  return (
    <div className="body">
      <div className="container">
        <h1 style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '2rem',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minWidth: '500px',
          maxWidth: '500px',
        }}>
          {currentSlogan}
        </h1>
        
        <div className="controls">
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <input
              value={isSearchMode ? searchQuery : input}
              onChange={handleInputChange}
              onKeyDown={e => e.key === 'Enter' && !isSearchMode && addMovie()}
              placeholder={isSearchMode ? "Haku..." : "Lisää leffa"}
              disabled={loading}
              style={{
                ...(isSearchMode ? { backgroundColor: '#fce4ec', borderColor: '#e91e63', color: '#333' } : {}),
                paddingRight: '70px' // Tilaa toggle-napille
              }}
            />
            <div 
              className="toggle-switch"
              onClick={toggleSearchMode}
              title={isSearchMode ? "Lisää leffa" : "Haku"}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '26px',
                backgroundColor: isSearchMode ? '#e91e63' : '#4caf50',
                borderRadius: '13px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  position: 'absolute',
                  left: isSearchMode ? '26px' : '2px',
                  transition: 'left 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {isSearchMode ? '🔍' : '➕'}
              </div>
            </div>
          </div>
          <button
            className="random-button"
            onClick={pickRandom}
          >
            🎲
          </button>
        </div>

        {isSearchMode && searchQuery.trim() && (
          <div style={{ 
            margin: '1rem 0', 
            padding: '0.5rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.9rem'
          }}>
            Löytyi {filteredMovies.length} tulosta haulle "{searchQuery}"
          </div>
        )}

        <div className="movies-list">
          {filteredMovies.map((movie) => (
            <MovieItem
              key={movie.id}
              movie={movie}
              onTitleClick={setModalMovie}
              onToggleWatched={toggleWatched}
              onRemove={removeMovie}
            />
          ))}
        </div>

        {modalMovie && (
          <MovieModal
            movie={modalMovie}
            onClose={() => setModalMovie(null)}
            onUpdateImdbID={updateMovieByImdbID}
          />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
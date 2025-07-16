import React, { useState, useEffect, useRef } from 'react';
import { searchMovies, type OMDBSearchResult } from './omdb';

interface MovieSearchInputProps {
  onMovieSelect: (movie: OMDBSearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MovieSearchInput: React.FC<MovieSearchInputProps> = ({
  onMovieSelect,
  placeholder = "Hae elokuvaa...",
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OMDBSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 3) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const searchResults = await searchMovies(query);
        setResults(searchResults);
        setIsLoading(false);
        setShowDropdown(true);
      }, 300); // 300ms debounce
    } else {
      setResults([]);
      setShowDropdown(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Sulje dropdown kun klikataan muualle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMovieSelect = (movie: OMDBSearchResult) => {
    setQuery(''); // Tyhjennä haku kun elokuva valitaan
    setShowDropdown(false);
    onMovieSelect(movie);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          width: '100%',
          padding: '12px 70px 12px 16px', // Lisää oikea padding toggle-switchille
          fontSize: '16px',
          backgroundColor: disabled ? '#f5f5f5' : 'white',
          color: disabled ? '#999' : '#333',
        }}
      />
      
      {isLoading && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          style={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {results.map((movie) => (
            <button
              key={movie.imdbID}
              onClick={() => handleMovieSelect(movie)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.png'}
                alt={movie.Title}
                style={{
                  width: '40px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-movie.png';
                }}
              />
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{movie.Title}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{movie.Year}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && query.length >= 3 && !isLoading && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
          style={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          Ei tuloksia haulle "{query}"
        </div>
      )}
    </div>
  );
};
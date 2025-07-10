import React from 'react';
import { type Movie } from './types';

interface MovieItemProps {
  movie: Movie;
  onTitleClick: (movie: Movie) => void;
  onToggleWatched: (id: string) => void;
  onRemove: (id: string) => void;
}

export const MovieItem: React.FC<MovieItemProps> = ({
  movie,
  onTitleClick,
  onToggleWatched,
  onRemove,
}) => {
  return (
    <div className={`movie-item ${movie.watched ? "watched" : ""}`}>
      {movie.poster && <img src={movie.poster} alt="" className="poster" />}
      <div className="movie-title" onClick={() => onTitleClick(movie)}>
        {movie.title} {movie.year && `(${movie.year})`}
      </div>
      {movie.rating && (
        <div className="badge" onClick={() => onToggleWatched(movie.id)}>
          {movie.rating}
        </div>
      )}
      <div className="remove" onClick={() => onRemove(movie.id)}>
        X
      </div>
    </div>
  );
};
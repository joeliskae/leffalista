import React from "react";
import { type Movie, type User } from "./types";

interface MovieItemProps {
  movie: Movie;
  currentUser: User;
  onTitleClick: (movie: Movie) => void;
  onToggleWatched: (movieId: string) => void;
  onRemove: (movieId: string) => void;
  onHeartToggle: (movieId: string) => void;
}

export const MovieItem: React.FC<MovieItemProps> = ({
  movie,
  currentUser,
  onTitleClick,
  onToggleWatched,
  onRemove,
  onHeartToggle,
}) => {
  const userHeart = currentUser.heart_color === 'yellow' ? movie.yellow_heart : movie.pink_heart;
  const otherHeart = currentUser.heart_color === 'yellow' ? movie.pink_heart : movie.yellow_heart;
  const bothHearted = movie.yellow_heart && movie.pink_heart;

  // Yhdistetään CSS-luokat: watched + both-hearted
  const cssClasses = [
    "movie-item",
    movie.watched ? "watched" : "",
    bothHearted ? "both-hearted" : ""
  ].filter(Boolean).join(" ");
  //  {movie.year && `(${movie.year})`}
  return (
    <div className={cssClasses}>
      {movie.poster && <img src={movie.poster} alt="" className="poster" />}
      
      <div className="movie-title" onClick={() => onTitleClick(movie)}>
        {movie.title} 
      </div>
      
      {movie.rating && (
        <div className="badge" onClick={() => onToggleWatched(movie.id)}>
          {movie.rating}
        </div>
      )}
      
      {/* Uusi sydän-osio */}
     <div className="heart-section">
  <button
  className={`heart-button ${bothHearted ? "both" : ""}`}
  onClick={() => onHeartToggle(movie.id)}
  title={
    bothHearted
      ? "Molemmat tykkää!"
      : userHeart
      ? "Sinä tykkäät tästä"
      : otherHeart
      ? "Kumppani tykkää tästä"
      : "Klikkaa sydäntä!"
  }
>
  {bothHearted
    ? "❤️‍🔥"
    : userHeart
    ? currentUser.heart_color === "yellow"
      ? "💛"
      : "💖"
    : otherHeart
    ? currentUser.heart_color === "yellow"
      ? "💖"
      : "💛"
    : "🤍"}
</button>
</div>
      
      <div className="remove" onClick={() => onRemove(movie.id)}>
        X
      </div>
    </div>
  );
};
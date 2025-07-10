import { type Movie } from './types';

export const slogans = [
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

export const getRandomSlogan = (): string => {
  return slogans[Math.floor(Math.random() * slogans.length)];
};

export const pickRandomMovie = (movies: Movie[]): Movie | null => {
  const unwatched = movies.filter((m) => !m.watched);
  if (unwatched.length === 0) return null;
  return unwatched[Math.floor(Math.random() * unwatched.length)];
};

export const filterMovies = (movies: Movie[], query: string): Movie[] => {
  if (!query.trim()) return movies;
  
  const searchTerm = query.toLowerCase();
  return movies.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.genre?.toLowerCase().includes(searchTerm) ||
      movie.director?.toLowerCase().includes(searchTerm) ||
      movie.actors?.toLowerCase().includes(searchTerm)
    );
  });
};
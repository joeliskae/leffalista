import React, { useState, useEffect } from 'react';
import { type Movie, type StreamingService } from './types';
import { backdropStyle, modalStyle } from './styles';
import { fetchStreamingData, consolidateStreamingServices } from './streaming';
import { StreamingServices } from './StreamingServices';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  onUpdateImdbID: (movieId: string, imdbID: string) => Promise<boolean>;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  onUpdateImdbID,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [imdbInput, setImdbInput] = useState(movie.imdbID || "");
  const [loading, setLoading] = useState(false);
  const [streamingServices, setStreamingServices] = useState<StreamingService[]>([]);
  const [streamingLoading, setStreamingLoading] = useState(false);

  useEffect(() => {
    if (movie.imdbID) {
      loadStreamingData(movie.imdbID);
    }
  }, [movie.imdbID]);

  const loadStreamingData = async (imdbID: string) => {
    setStreamingLoading(true);
    const services = await fetchStreamingData(imdbID);
    const consolidatedServices = consolidateStreamingServices(services);
    setStreamingServices(consolidatedServices);
    setStreamingLoading(false);
  };

  const handleSave = async () => {
    if (!imdbInput.trim()) {
      alert("Anna IMDb ID");
      return;
    }
    
    setLoading(true);
    try {
      const success = await onUpdateImdbID(movie.id, imdbInput.trim());
      if (success) {
        setEditMode(false);
        loadStreamingData(imdbInput.trim());
      } else {
        alert("IMDb ID ei löytynyt");
      }
    } catch {
      alert("Päivitys epäonnistui");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setImdbInput(movie.imdbID || "");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={backdropStyle}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              style={{
                width: "180px",
                borderRadius: "6px",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "180px",
                height: "270px",
                background: "#ccc",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              Ei julistetta
            </div>
          )}

          <div style={{ flex: 1, textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 0,
                marginBottom: "0.5rem",
              }}
            >
              <h2 style={{ margin: 0, flexGrow: 1 }}>
                {movie.title}{" "}
                {movie.year && (
                  <span style={{ color: "#888" }}>({movie.year})</span>
                )}
              </h2>
              {movie.rating && (
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    color: "gold",
                    marginLeft: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {movie.rating}{" "}
                  <span style={{ fontSize: "1.9rem", color: "gold" }}>★</span>
                </span>
              )}
            </div>

            {movie.genre && (
              <p>
                <strong>Genre:</strong> {movie.genre}
              </p>
            )}
            {movie.runtime && (
              <p>
                <strong>Kesto:</strong> {movie.runtime}
              </p>
            )}
            {movie.director && (
              <p>
                <strong>Ohjaaja:</strong> {movie.director}
              </p>
            )}
            {movie.actors && (
              <p>
                <strong>Näyttelijät:</strong> {movie.actors}
              </p>
            )}

            <p>
              <strong>Kuvaus:</strong> {movie.plot || "Ei kuvausta"}
            </p>

            <StreamingServices
              services={streamingServices}
              loading={streamingLoading}
              hasImdbID={!!movie.imdbID}
            />

            {editMode ? (
              <>
                <input
                  type="text"
                  placeholder="Anna IMDb ID, esim. tt0111161"
                  value={imdbInput}
                  onChange={(e) => setImdbInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    marginBottom: "0.5rem",
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{ marginRight: "0.5rem" }}
                >
                  {loading ? "Tallennetaan..." : "Tallenna"}
                </button>
                <button onClick={handleCancel}>
                  Peruuta
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{ marginTop: "1rem" }}
              >
                ✏️ Muokkaa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

declare const __APP_VERSION__: string;

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "1rem 0",
        textAlign: "center",
        fontStyle: "italic",
        color: "white",
        fontSize: "0.9rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        borderRadius: "4px",
      }}
    >
      <p style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
        Passion for movies — bringing our watchlist to life! Made with love
        ❤️ by Lihis
      </p>
      <p style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
        Versio {__APP_VERSION__}
      </p>
    </footer>
  );
};
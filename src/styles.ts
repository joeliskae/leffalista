import React from 'react';

export const backdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "10px",
  maxWidth: "700px",
  padding: "1.5rem",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  maxHeight: "80vh",
  overflowY: "auto",
};

export const streamingServiceStyle: React.CSSProperties = {
  display: "block",
  padding: "0.6rem",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  transition: "transform 0.15s ease",
  cursor: "pointer",
};

export const getStreamingTypeStyle = (streamingType: string): React.CSSProperties => {
  const baseStyle = {
    fontSize: "0.75rem",
    padding: "2px 5px",
    borderRadius: "3px",
    width: "fit-content",
  };

  switch (streamingType) {
    case "subscription":
      return {
        ...baseStyle,
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
      };
    case "rent":
      return {
        ...baseStyle,
        backgroundColor: "#fff3e0",
        color: "#ef6c00",
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: "#e3f2fd",
        color: "#1565c0",
      };
  }
};

export const getStreamingTypeText = (streamingType: string): string => {
  switch (streamingType) {
    case "subscription":
      return "Tilaus";
    case "rent":
      return "Vuokraus";
    default:
      return "Osto";
  }
};
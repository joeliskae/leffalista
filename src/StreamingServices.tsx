import React from 'react';
import { type StreamingService } from './types';
import { streamingServiceStyle, getStreamingTypeStyle, getStreamingTypeText } from './styles';

interface StreamingServicesProps {
  services: StreamingService[];
  loading: boolean;
  hasImdbID: boolean;
}

export const StreamingServices: React.FC<StreamingServicesProps> = ({
  services,
  loading,
  hasImdbID,
}) => {
  if (loading) {
    return (
      <p style={{ fontStyle: "italic", color: "#666" }}>
        Ladataan streaming-tietoja...
      </p>
    );
  }

  if (services.length === 0) {
    if (hasImdbID) {
      return (
        <p style={{ fontStyle: "italic", color: "#666" }}>
          Ei löytynyt streaming-palveluja Suomesta
        </p>
      );
    } else {
      return (
        <p style={{ fontStyle: "italic", color: "#666" }}>
          Lisää IMDb ID nähdäksesi streaming-tiedot
        </p>
      );
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {services.map((service, index) => (
        <a
          key={index}
          href={service.link}
          target="_blank"
          rel="noopener noreferrer"
          style={streamingServiceStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "capitalize",
              marginBottom: "0.3rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {service.service}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
            }}
          >
            <span style={getStreamingTypeStyle(service.streamingType)}>
              {getStreamingTypeText(service.streamingType)}
            </span>

            {service.videoQuality && (
              <span style={{ fontSize: "0.7rem", color: "#777" }}>
                {service.videoQuality.toUpperCase()}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
};
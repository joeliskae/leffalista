import React, { useState } from "react";

interface UserSelectionProps {
  onUserSelect: (heartColor: 'yellow' | 'pink') => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ onUserSelect }) => {
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'pink' | null>(null);

  const handleSelect = () => {
    if (selectedColor) {
      onUserSelect(selectedColor);
    }
  };

  return (
    <div className="user-selection-modal">
      <div className="user-selection-content">
        <h2>Kumpi sydän kuuluu sinulle ?</h2>
        <p></p>
        
        <div className="heart-options">
          <button
            className={`heart-button-modal ${selectedColor === 'yellow' ? 'selected' : ''}`}
            onClick={() => setSelectedColor('yellow')}
          >
            💛
          </button>
          <button
            className={`heart-button-modal ${selectedColor === 'pink' ? 'selected' : ''}`}
            onClick={() => setSelectedColor('pink')}
          >
            💖
          </button>
        </div>
        
        <button 
          className="confirm-button"
          onClick={handleSelect}
          disabled={!selectedColor}
        >
          Valitse
        </button>
      </div>
    </div>
  );
};
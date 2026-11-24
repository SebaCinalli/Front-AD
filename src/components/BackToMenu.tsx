import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './BackToMenu.css';

interface BackToMenuProps {
  className?: string;
}

export const BackToMenu: React.FC<BackToMenuProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate('/');
  };

  return (
    <button
      className={`back-to-menu-btn ${className}`}
      onClick={handleBackToMenu}
      title="Volver al menú"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      <span>Volver</span>
    </button>
  );
};

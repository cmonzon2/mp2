import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useRef, useEffect, useState } from "react";
import artFrame from './assets/artframe.png';
import { useLocation, useNavigate } from 'react-router-dom';

function ArtworkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const art = location.state?.art;
  const allArtworks = location.state?.allArtworks || [];
  const [currentIndex, setCurrentIndex] = useState(location.state?.index || 0);

  const artworkRef = useRef<HTMLImageElement>(null);
  const [artworkWidth, setArtworkWidth] = useState(0);

  useEffect(() => {
    if (artworkRef.current) {
      setArtworkWidth(artworkRef.current.offsetWidth);
    }
  }, [art, currentIndex]);

  if (!art || allArtworks.length === 0) {
    return (
      <div>
        <p>No artwork data found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const currentArt = allArtworks[currentIndex];

  const imageUrl = currentArt.image_id 
    ? `https://www.artic.edu/iiif/2/${currentArt.image_id}/full/843,/0/default.jpg` 
    : null;

  // Handlers
  const handleNext = () => {
    if (currentIndex < allArtworks.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="artworkDetails">
      <button onClick={() => navigate(-1)}>Back to Gallery</button>

      <div className="navigationButtons">
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </button>
        <button onClick={handleNext} disabled={currentIndex === allArtworks.length - 1}>
          Next
        </button>
      </div>

      <div className="white">
        <h1>{currentArt.title}</h1>
        <h2>{currentArt.artist_title || 'Unknown Artist'}</h2>
        <p>{currentArt.date_display || currentArt.date_start}</p>
        <p>{currentArt.classification_title}</p>
        <p>{currentArt.place_of_origin}</p>
        <p>{currentArt.description}</p>
      </div>

      <div className="artImageWrapper2" 
        style={{ '--art-width': `${artworkWidth}px` } as React.CSSProperties}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={currentArt.title}
            className="artwork2"
            ref={artworkRef}
          />
        ) : (
          <div className="noImage">Preview Unavailable</div>
        )}
        <img src={artFrame} alt="frame" className="artFrame2" />
      </div>
    </div>
  );
}

export default ArtworkPage;
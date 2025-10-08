import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import artFrame from './assets/artframe.png';
import { Link } from 'react-router-dom';

const api = axios.create({
  baseURL: 'https://api.artic.edu/api/v1/artworks', // Replace with your API base URL
  timeout: 2000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

function App() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([]);
  const [isGallery, setGallery] = useState(false);
  // const types = ["All", "Painting", "Sculpture", "Drawing", "Photography", "Print"];
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [currType, setCurrType] = useState("All");
  const [sortOption, setSortOption] = useState<"title" | "artist">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchPaintings() {
      const paintings = await axios.get('https://api.artic.edu/api/v1/artworks/search', {
        params: { q: 'painting', fields: 'id,title,image_id,artist_title,classification_title,date_display,date_start,place_of_origin,description', limit: 100 },
      });

      const drawings = await axios.get('https://api.artic.edu/api/v1/artworks/search', {
        params: { q: 'drawing', fields: 'id,title,image_id,artist_title,classification_title,date_display,date_start,place_of_origin,description', limit: 100 },
      });

      const combined = [...paintings.data.data, ...drawings.data.data];
      setArtworks(combined);
    }

    fetchPaintings();
  }, []);

  useEffect(() => {
    const filtered = artworks.filter((art) =>
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      (art.artist_title && art.artist_title.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredArtworks(filtered);
  }, [search, artworks]);

  useEffect(() => {
      const newTypes = new Set<string>(["All"]);
      artworks.forEach((art) => {
        if (art.classification_title) {
          newTypes.add(art.classification_title);
        }
      });
      setTypes(newTypes);
    }, [artworks]);

    const displayedArtworks = filteredArtworks.sort((a, b) => {
        const fieldA = sortOption === "title" ? a.title : a.artist_title || "";
        const fieldB = sortOption === "title" ? b.title : b.artist_title || "";

        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });


  return (
    <div className="body">
      <div className="webTitle">
        <h1>Art Institute of Chicago - Artworks</h1>
      </div>
      <br></br>
      <div className="options">
        <p
          onClick={() => setGallery(false)}
          className={`${!isGallery ? "activeOption" : ""}`}
        >
          Search
        </p>
        <p
          onClick={() => setGallery(true)}
          className={`${isGallery ? "activeOption" : ""}`}
        >
        Gallery
        </p>
      </div>
      {isGallery && 
      <div className="filterRow">
        {Array.from(types).slice(0, 15).map((type) => (
          <button
            key={type}
            className={`filterButton ${currType === type ? "active" : ""}`}
            onClick={() => setCurrType(type)}
          >
            {type}
          </button>
        ))}
      </div>}
      {!isGallery &&
      <div>
        <div className="searchBox">
          <input
            type="text"
            placeholder="Search the gallery.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <br></br>

        <div className="sortRow">
          <label>
            Sort by:&nbsp;
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value as "title" | "artist")}>
              <option value="title">Art Title</option>
              <option value="artist">Artist Title</option>
            </select>
          </label>

          <label>
            &nbsp;&nbsp;Order:&nbsp;
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <br></br>
      </div>
      
      }

      {isGallery &&
      <div className="artGrid">
        {artworks
      .filter((art) => {
        if (currType === "All") return true; 
        return  currType.toLowerCase().includes(art.classification_title);
      })
      .map((art, idx) => {
        const imageUrl = art.image_id
          ? `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
          : null;

        return (
          <Link to={`/artwork/${art.id}`} state={{ art, allArtworks: displayedArtworks, index: idx }}>
          <div key={art.id} className="artCard">
            <div className="artImageWrapper">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={art.title}
                  className="artwork"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      const newdiv = document.createElement('div');
                      newdiv.className = 'noImage';
                      newdiv.innerText = 'No Image';
                      parent.replaceChild(newdiv, target);
                    }
                  }}
                />
              ) : (
                <div className="noImage">Preview Unavailable</div>
              )}
              <img src={artFrame} alt="frame" className="artFrame" />
            </div>
            <div className="artTitle">
              <h3>{art.title}</h3>
              <p>
                {art.artist_title || 'Unknown Artist'} - {art.date_display || art.date_start}
              </p>
            </div>
          </div>
          </Link>
        );
      })}
      </div>
      }

      {!isGallery &&
      <div className="artGrid">
        {displayedArtworks.map((art, idx) => {
          const imageUrl = art.image_id
            ? `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
            : null;

          return (
            <Link to={`/artwork/${art.id}`} state={{ art, allArtworks: displayedArtworks, index: idx}}>
            <div key={art.id} className="artCard">
              <div className="artImageWrapper">
                {imageUrl ? (
                  <img src={imageUrl} alt={art.title} className="artwork" />
                ) : (
                  <div className="noImage">Preview Unavailable</div>
                )}
                <img src={artFrame} alt="frame" className="artFrame" />
              </div>
              <div className="artTitle">
                <h3>{art.title}</h3>
                <p>
                  {art.artist_title || 'Unknown Artist'} - {art.date_display || ''}
                </p>
              </div>
            </div>
            </Link>
          );
        })}
      </div>
      }
    </div>
  );
}

export default App;

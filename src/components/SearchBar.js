import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://api.example.com/search`, {
        params: {
          query: query,
        },
      });
      setResults(response.data.results); 
      onSearch(results);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="search-bar p-4">
      <div className="container d-flex justify-content-center gap-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for doctors, labs, or services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: '500px', width: '100%' }} // Reduce max width
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div>
        {results.length > 0 && (
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

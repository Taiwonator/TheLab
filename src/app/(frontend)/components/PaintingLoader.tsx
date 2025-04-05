'use client';

import React from 'react';

const PaintingLoader: React.FC = () => {
  return (
    <div className="painting-loader">
      <div className="painting-loader-content">
        <div className="paintbrush">
          <div className="brush-handle"></div>
          <div className="brush-head"></div>
          <div className="paint-drip drip-1"></div>
          <div className="paint-drip drip-2"></div>
          <div className="paint-drip drip-3"></div>
        </div>
        <div className="painting-text">
          <h3>Painting in progress...</h3>
          <p>Creating your masterpiece</p>
        </div>
      </div>
    </div>
  );
};

export default PaintingLoader;

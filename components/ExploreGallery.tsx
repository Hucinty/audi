import React from 'react';
import type { GalleryItem } from '../types';

interface ExploreGalleryProps {
  images: GalleryItem[];
  onImageSelect: (item: GalleryItem) => void;
}

const ExploreGallery: React.FC<ExploreGalleryProps> = ({ images, onImageSelect }) => {
  if (images.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-[var(--text-color)] opacity-60">
        <p>Your generated images will appear here. Create something amazing!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-1">
      {images.map((item) => (
        <button
          key={item.id}
          onClick={() => onImageSelect(item)}
          className="aspect-square relative group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-[var(--primary-color)]"
        >
          <img
            src={item.stylizedImage}
            alt="Generated art"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">Re-stylize</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ExploreGallery;

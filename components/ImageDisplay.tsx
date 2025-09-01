import React from 'react';
import Spinner from './Spinner';
import type { Style } from '../types';

interface ImagePanelsProps {
  originalImage: string | null;
  stylizedImage: string | null;
  isLoading: boolean;
  error: string | null;
  currentStyle: Style | null;
  mode: 'image' | 'text';
  aspectRatio: string;
}

const getAspectRatioClass = (ratio: string): string => {
  switch (ratio) {
    case '9:16':
      return 'aspect-[9/16]';
    case '16:9':
      return 'aspect-[16/9]';
    case '3:4':
      return 'aspect-[3/4]';
    case '4:3':
      return 'aspect-[4/3]';
    default:
      return 'aspect-square';
  }
};

const ImagePanel: React.FC<{
  title: string,
  imageSrc: string | null,
  children?: React.ReactNode,
  aspectRatioClass?: string
}> = ({ title, imageSrc, children, aspectRatioClass = 'aspect-square' }) => (
    <div className={`w-full flex flex-col`}>
        <h2 className="text-sm tracking-widest text-[var(--text-color)] opacity-70 mb-2 text-center transition-colors duration-500">{title}</h2>
        <div className={`${aspectRatioClass} w-full border-2 border-[var(--border-color)] bg-[var(--secondary-bg-color)] flex items-center justify-center p-2 transition-colors duration-500`}>
            {imageSrc ? <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain" /> : children}
        </div>
    </div>
);


const ImagePanels: React.FC<ImagePanelsProps> = ({ originalImage, stylizedImage, isLoading, error, currentStyle, mode, aspectRatio }) => {
  const placeholder = <p className="text-[var(--text-color)] opacity-50 text-center p-4 transition-colors duration-500">Output will appear here</p>;

  const getFileExtensionFromDataUrl = (dataUrl: string): string => {
    const mimeTypeMatch = dataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mimeTypeMatch && mimeTypeMatch.length > 1) {
      const mimeType = mimeTypeMatch[1];
      return mimeType.split('/')[1] || 'png';
    }
    return 'png';
  };

  const renderStylizedContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-2 text-[var(--text-color)] transition-colors duration-500">
          <Spinner className="w-10 h-10" />
          <p>{mode === 'image' ? 'Stylizing...' : 'Generating...'}</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center text-red-500 p-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (stylizedImage) {
      return null; 
    }
    if (currentStyle) {
      return <img src={currentStyle.sampleImage} alt={`${currentStyle.name} sample`} className="max-w-full max-h-full object-contain" />;
    }
    return placeholder;
  };
  
  const stylizedTitle = mode === 'image' ? "STYLIZED" : "GENERATED IMAGE";
  const stylizedPanelAspectRatioClass = mode === 'image' ? 'aspect-square' : getAspectRatioClass(aspectRatio);

  return (
    <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 overflow-y-auto items-center justify-center">
      {mode === 'image' && (
        <ImagePanel title="ORIGINAL" imageSrc={originalImage}>
            <p className="text-[var(--text-color)] opacity-50 text-center p-4 transition-colors duration-500">Upload an image to start</p>
        </ImagePanel>
      )}

      <div className={`w-full ${mode === 'image' ? 'md:w-1/2' : 'md:w-2/3 lg:w-1/2'} flex flex-col`}>
        <ImagePanel
          title={stylizedTitle}
          imageSrc={stylizedImage}
          aspectRatioClass={stylizedPanelAspectRatioClass}
        >
          {renderStylizedContent()}
        </ImagePanel>

        {stylizedImage && !isLoading && !error && (
            <a
                href={stylizedImage}
                download={`generated-image.${getFileExtensionFromDataUrl(stylizedImage)}`}
                className="mt-4 w-full text-center p-3 border-2 border-[var(--border-color)] bg-[var(--secondary-bg-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all duration-300"
                aria-label="Download generated image"
            >
                Download Image
            </a>
        )}
      </div>
    </div>
  );
};

export default ImagePanels;
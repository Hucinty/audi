import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { STYLES, DEFAULT_GALLERY_IMAGES } from './constants';
import ControlPanel from './components/StyleSelector';
import ImagePanels from './components/ImageDisplay';
import { stylizeImage, generateImageFromText } from './services/geminiService';
import type { Style, GalleryItem } from './types';

// Helper to convert file to base64
const fileToDataUrl = (file: File): Promise<{ dataUrl: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.substring(5, result.indexOf(';'));
      resolve({ dataUrl: result, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type Mode = 'image' | 'text';
type ControlTab = 'effects' | 'explore';

const loadedFonts = new Set<string>();

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ dataUrl: string; mimeType: string; } | null>(null);
  const [stylizedImage, setStylizedImage] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<Style | null>(null);
  const [userText, setUserText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('image');
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>('effects');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  // Load gallery from localStorage on mount, with fallback to default
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem('ai-style-gallery');
      if (savedGallery && JSON.parse(savedGallery).length > 0) {
        setGalleryImages(JSON.parse(savedGallery));
      } else {
        setGalleryImages(DEFAULT_GALLERY_IMAGES);
      }
    } catch (e) {
      console.error("Failed to load gallery from local storage", e);
      setGalleryImages(DEFAULT_GALLERY_IMAGES); // Fallback on error
    }
  }, []);

  // Save gallery to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('ai-style-gallery', JSON.stringify(galleryImages));
    } catch (e) {
      console.error("Failed to save gallery to local storage", e);
    }
  }, [galleryImages]);

  const activeStyle = useMemo(() => {
    const defaultStyle = {
      theme: {
        '--bg-color': '#EBFBFF',
        '--text-color': '#042A38',
        '--primary-color': '#0891b2',
        '--accent-color': '#0e7490',
        '--secondary-bg-color': 'rgba(107, 114, 128, 0.1)',
        '--border-color': '#22d3ee',
      },
      fontFamily: "'Share Tech Mono', monospace",
      fontUrl: '',
    };
    
    const style = currentStyle ?? defaultStyle;

    // Dynamically load font
    if (style.fontUrl && !loadedFonts.has(style.fontUrl)) {
      const link = document.createElement('link');
      link.href = style.fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      loadedFonts.add(style.fontUrl);
    }
    
    return {
      theme: style.theme,
      fontFamily: style.fontFamily
    };
  }, [currentStyle]);

  const handleImageUpload = async (file: File) => {
    try {
      const { dataUrl, mimeType } = await fileToDataUrl(file);
      setOriginalImage({ dataUrl, mimeType });
      setStylizedImage(null);
      setError(null);
    } catch (e) {
      setError('Failed to read the image file.');
      console.error(e);
    }
  };
  
  const handleStyleChange = (style: Style) => {
    setCurrentStyle(style);
  };

  const handleModeChange = (newMode: Mode) => {
    if (mode === newMode) return;
    setMode(newMode);
    setOriginalImage(null);
    setStylizedImage(null);
    setUserText('');
    setError(null);
  };

  const handleGalleryImageSelect = (item: GalleryItem) => {
    const styleForItem = STYLES.find(s => s.id === item.styleId);
    if (styleForItem) {
      setCurrentStyle(styleForItem);
    }
    setOriginalImage(item.originalImage);
    setUserText(item.prompt || '');
    setMode('image');
    setActiveControlTab('effects');
    setStylizedImage(null);
    setError(null);
  };
  
  const runGeneration = useCallback(async () => {
    if (!currentStyle) return;
    
    setIsLoading(true);
    setError(null);
    setStylizedImage(null);

    try {
      let resultImageUrl: string;
      if (mode === 'image' && originalImage) {
        const base64Data = originalImage.dataUrl.split(',')[1];
        resultImageUrl = await stylizeImage(base64Data, originalImage.mimeType, currentStyle.prompt, userText);
      } else if (mode === 'text' && userText.trim()) {
        resultImageUrl = await generateImageFromText(userText, currentStyle.prompt, aspectRatio);
      } else {
        throw new Error("Invalid state for generation.");
      }
      setStylizedImage(resultImageUrl);

      // Add to gallery
      const newGalleryItem: GalleryItem = {
        id: new Date().getTime().toString(),
        originalImage: (mode === 'image' && originalImage) ? originalImage : { dataUrl: resultImageUrl, mimeType: 'image/png' },
        stylizedImage: resultImageUrl,
        styleId: currentStyle.id,
        prompt: userText,
      };
      setGalleryImages(prev => [newGalleryItem, ...prev].slice(0, 30)); // Limit gallery size

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, currentStyle, userText, mode, aspectRatio]);

  return (
    <main 
      className="bg-[var(--bg-color)] h-screen max-h-screen w-full flex flex-col lg:flex-row overflow-hidden transition-all duration-500"
      style={{
        ...activeStyle.theme,
        fontFamily: activeStyle.fontFamily,
      } as React.CSSProperties}
    >
      <ControlPanel
        styles={STYLES}
        selectedStyleId={currentStyle?.id ?? null}
        onStyleChange={handleStyleChange}
        onImageUpload={handleImageUpload}
        isLoading={isLoading}
        userText={userText}
        onTextChange={setUserText}
        onGenerateClick={runGeneration}
        isImageUploaded={!!originalImage}
        mode={mode}
        onModeChange={handleModeChange}
        galleryImages={galleryImages}
        onGalleryImageSelect={handleGalleryImageSelect}
        activeTab={activeControlTab}
        onTabChange={setActiveControlTab}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
      <div className="w-px bg-[var(--border-color)] opacity-50 hidden lg:block transition-colors duration-500" />
      <div className="h-px w-full bg-[var(--border-color)] opacity-50 block lg:hidden transition-colors duration-500" />
      <ImagePanels
        originalImage={originalImage?.dataUrl ?? null}
        stylizedImage={stylizedImage}
        isLoading={isLoading}
        error={error}
        currentStyle={currentStyle}
        mode={mode}
        aspectRatio={aspectRatio}
      />
    </main>
  );
};

export default App;
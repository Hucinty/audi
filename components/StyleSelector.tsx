import React, { useRef } from 'react';
import type { Style, GalleryItem } from '../types';
import Spinner from './Spinner';
import ExploreGallery from './ExploreGallery';

interface ControlPanelProps {
  styles: Style[];
  selectedStyleId: string | null;
  onStyleChange: (style: Style) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  userText: string;
  onTextChange: (text: string) => void;
  onGenerateClick: () => void;
  isImageUploaded: boolean;
  mode: 'image' | 'text';
  onModeChange: (mode: 'image' | 'text') => void;
  galleryImages: GalleryItem[];
  onGalleryImageSelect: (item: GalleryItem) => void;
  activeTab: 'effects' | 'explore';
  onTabChange: (tab: 'effects' | 'explore') => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

const ASPECT_RATIOS = ['1:1', '9:16', '16:9', '3:4', '4:3'];

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  styles, 
  selectedStyleId, 
  onStyleChange, 
  onImageUpload, 
  isLoading, 
  userText, 
  onTextChange, 
  onGenerateClick, 
  isImageUploaded, 
  mode, 
  onModeChange,
  galleryImages,
  onGalleryImageSelect,
  activeTab,
  onTabChange,
  aspectRatio,
  onAspectRatioChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isButtonDisabled = isLoading || !selectedStyleId || (mode === 'image' ? !isImageUploaded : !userText.trim());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getDisabledMessage = () => {
    if (isLoading) return 'Generation in progress...';
    if (!selectedStyleId) {
      return 'Please select an effect.';
    }
    if (mode === 'image' && !isImageUploaded) {
      return 'Please upload an image.';
    }
    if (mode === 'text' && !userText.trim()) {
      return 'Please enter a prompt.';
    }
    return 'Ready to generate!';
  };

  const modeButtonClasses = (buttonMode: 'image' | 'text') => 
    `w-1/2 p-2 text-sm transition-all duration-300 ${
      mode === buttonMode 
        ? 'bg-[var(--primary-color)] text-[var(--bg-color)]' 
        : 'bg-transparent text-[var(--text-color)] hover:bg-[var(--secondary-bg-color)]'
    }`;
  
  const tabButtonClasses = (tabName: 'effects' | 'explore') => 
    `w-1/2 p-2 text-sm tracking-widest transition-all duration-300 ${
      activeTab === tabName
        ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]'
        : 'border-b-2 border-transparent text-[var(--text-color)] opacity-70 hover:opacity-100'
    }`;

  const ratioButtonClasses = (ratio: string) =>
    `flex-1 p-2 text-xs border-2 border-[var(--border-color)] transition-all duration-300 ${
      aspectRatio === ratio
        ? 'bg-[var(--primary-color)] text-[var(--bg-color)]'
        : 'bg-transparent text-[var(--text-color)] hover:bg-[var(--secondary-bg-color)]'
    }`;

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-4 flex flex-col gap-4 max-h-screen text-[var(--text-color)] transition-colors duration-500">
      <header>
        <h1 className="text-xl font-bold tracking-wider">[ * ] AI STYLE CONVERTER</h1>
      </header>

      <div className="flex border-2 border-[var(--border-color)]">
        <button onClick={() => onModeChange('image')} className={modeButtonClasses('image')}>Image Style</button>
        <button onClick={() => onModeChange('text')} className={modeButtonClasses('text')}>Text to Image</button>
      </div>

      {mode === 'image' && (
        <section>
          <h2 className="text-sm tracking-widest opacity-70 mb-2">- UPLOAD IMAGE -</h2>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button
            onClick={handleButtonClick}
            className="w-full p-3 border-2 border-[var(--border-color)] bg-[var(--secondary-bg-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all duration-300"
          >
            Select an Image...
          </button>
        </section>
      )}

      <section>
        <h2 className="text-sm tracking-widest opacity-70 mb-2">- {mode === 'image' ? 'ADD TEXT (OPTIONAL)' : 'PROMPT'} -</h2>
        <textarea
          value={userText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={mode === 'image' ? "Text to add to the image..." : "A majestic lion king..."}
          className="w-full p-2 bg-[var(--secondary-bg-color)] border-2 border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none transition-colors duration-500 min-h-[80px]"
        />
      </section>

      {mode === 'text' && (
        <section>
          <h2 className="text-sm tracking-widest opacity-70 mb-2">- ASPECT RATIO -</h2>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button key={ratio} onClick={() => onAspectRatioChange(ratio)} className={ratioButtonClasses(ratio)}>
                {ratio}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col flex-grow min-h-0">
        <div className="flex">
          <button onClick={() => onTabChange('effects')} className={tabButtonClasses('effects')}>EFFECTS</button>
          <button onClick={() => onTabChange('explore')} className={tabButtonClasses('explore')}>EXPLORE</button>
        </div>
        <div className="flex-grow overflow-y-auto border-x-2 border-b-2 border-[var(--border-color)]">
          {activeTab === 'effects' ? (
            <div className="flex flex-col gap-1 p-1">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style)}
                  className={`flex items-center gap-3 p-2 text-left transition-all duration-200 ${selectedStyleId === style.id ? 'text-[var(--primary-color)]' : 'hover:pl-4'}`}
                >
                  <span className="w-6">{selectedStyleId === style.id ? '[ * ]' : '[  ]'}</span>
                  <span>{style.icon}</span>
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <ExploreGallery images={galleryImages} onImageSelect={onGalleryImageSelect} />
          )}
        </div>
      </section>
      
      <div className="mt-auto pt-4">
        <button
          onClick={onGenerateClick}
          disabled={isButtonDisabled}
          title={getDisabledMessage()}
          className="w-full p-4 text-lg border-2 border-[var(--border-color)] flex items-center justify-center gap-2 transition-all duration-300 enabled:hover:bg-[var(--accent-color)] enabled:hover:text-[var(--bg-color)] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isButtonDisabled ? 'transparent' : 'var(--primary-color)',
            color: isButtonDisabled ? 'var(--text-color)' : 'var(--bg-color)',
            '--tw-ring-offset-color': 'var(--bg-color)'
          } as React.CSSProperties}
        >
          {isLoading ? <><Spinner className="w-5 h-5" /> Generating...</> : 'Generate Image'}
        </button>
        <p className="text-xs text-center mt-2 opacity-60 h-4">{getDisabledMessage()}</p>
      </div>

    </div>
  );
};

export default ControlPanel;
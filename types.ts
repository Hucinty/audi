export interface Style {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  sampleImage: string;
  theme: {
    '--bg-color': string;
    '--text-color': string;
    '--primary-color': string;
    '--accent-color': string;
    '--secondary-bg-color': string;
    '--border-color': string;
  };
  fontFamily: string;
  fontUrl: string;
}

export interface GalleryItem {
  id: string;
  originalImage: {
    dataUrl: string;
    mimeType: string;
  };
  stylizedImage: string;
  styleId: string;
  prompt: string;
}

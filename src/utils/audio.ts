// Preload and cache audio files
const audioCache = new Map<string, HTMLAudioElement>();

export const preloadAudio = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (audioCache.has(url)) {
      resolve();
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    
    const handleLoad = () => {
      audioCache.set(url, audio);
      cleanup();
      resolve();
    };
    
    const handleError = (error: ErrorEvent) => {
      cleanup();
      reject(error);
    };
    
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', handleLoad);
      audio.removeEventListener('error', handleError);
    };
    
    audio.addEventListener('canplaythrough', handleLoad);
    audio.addEventListener('error', handleError);
    audio.src = url;
    audio.load();
  });
};

export const playAudio = async (url: string): Promise<void> => {
  try {
    // Ensure audio is preloaded
    if (!audioCache.has(url)) {
      await preloadAudio(url);
    }
    
    const audio = audioCache.get(url)!;
    audio.currentTime = 0;
    
    // Create and play a new instance to handle rapid playback
    const playInstance = audio.cloneNode() as HTMLAudioElement;
    playInstance.volume = 0.5;
    
    // Handle mobile browser autoplay restrictions
    try {
      await playInstance.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

// Preload common sounds
export const SOUND_OPTIONS = {
  gentle: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  chime: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'
};

// Preload sounds on module load
Object.values(SOUND_OPTIONS).forEach(preloadAudio);
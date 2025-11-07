// Audio Manager for Auction Sound Effects
export class AudioManager {
  private static instance: AudioManager;
  private entranceAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private constructor() {
    // Guard against SSR - only initialize in browser
    if (typeof window === 'undefined') {
      return;
    }
    
    // Initialize audio elements
    this.setupAudio();
    
    // Load mute state from localStorage
    const savedMute = localStorage.getItem('auction_audio_muted');
    this.isMuted = savedMute === 'true';
    
    const savedVolume = localStorage.getItem('auction_audio_volume');
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private setupAudio() {
    // Guard against SSR
    if (typeof window === 'undefined') {
      return;
    }
    
    // Use local Pixabay royalty-free sound effects
    // For entrance music: Fanfare 1 by BenKirb (5 seconds)
    // Source: https://pixabay.com/sound-effects/fanfare-1-276819/
    // Download and place in client/public/sounds/fanfare.mp3
    this.entranceAudio = new Audio();
    this.entranceAudio.src = '/sounds/fanfare.mp3';
    this.entranceAudio.volume = this.volume;
    this.entranceAudio.loop = false;

    // Preload audio
    this.entranceAudio.load();
  }

  playEntranceMusic() {
    if (this.isMuted || !this.entranceAudio) return;
    
    try {
      this.entranceAudio.currentTime = 0;
      this.entranceAudio.volume = this.volume;
      const playPromise = this.entranceAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Entrance music play prevented:', error);
        });
      }
    } catch (error) {
      console.error('Error playing entrance music:', error);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('auction_audio_muted', muted.toString());
    
    // Stop all sounds when muting
    if (muted) {
      if (this.entranceAudio) {
        this.entranceAudio.pause();
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('auction_audio_volume', this.volume.toString());
    
    if (this.entranceAudio) {
      this.entranceAudio.volume = this.volume;
    }
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  getVolume(): number {
    return this.volume;
  }

  // Method to update audio sources if user wants custom audio
  updateAudioSources(entranceSrc?: string) {
    if (entranceSrc && this.entranceAudio) {
      this.entranceAudio.src = entranceSrc;
      this.entranceAudio.load();
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

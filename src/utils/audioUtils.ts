const SOUNDS: Record<string, string> = {
  crunch: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Potato chip crunch
  sizzle: "https://assets.mixkit.co/active_storage/sfx/2581/2581-preview.mp3", // Sizzling pan
  pour: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Liquid pour
  grind: "https://assets.mixkit.co/active_storage/sfx/2564/2564-preview.mp3", // Coffee grind
  hover: "https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3", // Subtle tech hover
};

class AudioSystem {
  private static instance: AudioSystem;
  private audioMap: Map<string, HTMLAudioElement> = new Map();

  private constructor() {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.2; // Keep it subtle and "premium"
      this.audioMap.set(key, audio);
    });
  }

  public static getInstance() {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  public play(key: string) {
    // Disabled as requested
  }

  public playByItem(name: string, category: string) {
    // Disabled as requested
  }
}

export const audioSystem = AudioSystem.getInstance();

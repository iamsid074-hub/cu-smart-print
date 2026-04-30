import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'pop' | 'tick' | 'success' | 'error' | 'swipe' | 'unlock';

let globalAudioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!globalAudioCtx) {
    try {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

export function useSound() {
  useEffect(() => {
    // Initialize AudioContext lazily on first user interaction
    const initAudio = () => {
      getAudioCtx();
    };

    window.addEventListener('touchstart', initAudio, { once: true, passive: true });
    window.addEventListener('click', initAudio, { once: true, capture: true });

    return () => {
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('click', initAudio);
    };
  }, []);

  const play = useCallback((type: SoundType) => {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'pop':
        // Soft bubble pop (adding to cart)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'tick':
        // Apple Keyboard Click style (hollow, percussive)
        // Primary "thud" component
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.03);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

        // High-frequency transient (the "click")
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1200, t);
        clickOsc.frequency.exponentialRampToValueAtTime(800, t + 0.01);
        clickGain.gain.setValueAtTime(0, t);
        clickGain.gain.linearRampToValueAtTime(0.15, t + 0.001);
        clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.01);

        osc.start(t);
        osc.stop(t + 0.03);
        clickOsc.start(t);
        clickOsc.stop(t + 0.01);
        break;

      case 'unlock':
        // Apple Pay / App Store Success Chime (Bright "Ding-Ding")
        // Note 1: E6 (~1318 Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1318.51, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        
        // Add a triangle wave for metallic/bell harmonic richness
        const oscHarm1 = ctx.createOscillator();
        const gainHarm1 = ctx.createGain();
        oscHarm1.connect(gainHarm1);
        gainHarm1.connect(ctx.destination);
        oscHarm1.type = 'triangle';
        oscHarm1.frequency.setValueAtTime(2637.02, t); // Octave up
        gainHarm1.gain.setValueAtTime(0, t);
        gainHarm1.gain.linearRampToValueAtTime(0.1, t + 0.01);
        gainHarm1.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        // Note 2: G#6 (~1661 Hz)
        const oscU2 = ctx.createOscillator();
        const gainU2 = ctx.createGain();
        oscU2.connect(gainU2);
        gainU2.connect(ctx.destination);
        oscU2.type = 'sine';
        oscU2.frequency.setValueAtTime(1661.22, t + 0.15);
        gainU2.gain.setValueAtTime(0, t + 0.15);
        gainU2.gain.linearRampToValueAtTime(0.5, t + 0.17);
        gainU2.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        // Harmonic for Note 2
        const oscHarm2 = ctx.createOscillator();
        const gainHarm2 = ctx.createGain();
        oscHarm2.connect(gainHarm2);
        gainHarm2.connect(ctx.destination);
        oscHarm2.type = 'triangle';
        oscHarm2.frequency.setValueAtTime(3322.44, t + 0.15);
        gainHarm2.gain.setValueAtTime(0, t + 0.15);
        gainHarm2.gain.linearRampToValueAtTime(0.15, t + 0.16);
        gainHarm2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        
        osc.start(t); osc.stop(t + 0.3);
        oscHarm1.start(t); oscHarm1.stop(t + 0.2);
        oscU2.start(t + 0.15); oscU2.stop(t + 0.5);
        oscHarm2.start(t + 0.15); oscHarm2.stop(t + 0.4);
        break;

      case 'success':
        // Two-tone ascending chime (checkout success/unlock)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.setValueAtTime(0.3, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;

      case 'error':
        // Low double-beep (wrong passcode/insufficient balance)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        // Second beep
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(150, t + 0.15);
        gain2.gain.setValueAtTime(0, t + 0.15);
        gain2.gain.linearRampToValueAtTime(0.3, t + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        
        osc.start(t); osc.stop(t + 0.1);
        osc2.start(t + 0.15); osc2.stop(t + 0.25);
        break;

      case 'swipe':
        // Smooth soft swoosh (switching tabs)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.15);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  }, []);

  return { play };
}

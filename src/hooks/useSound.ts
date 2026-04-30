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
        // Mechanical dry tick (numpad/passcode)
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'unlock':
        // Apple-style subtle mechanical "snick" or "clack"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        
        // Second tiny click to simulate mechanical snap
        const oscU2 = ctx.createOscillator();
        const gainU2 = ctx.createGain();
        oscU2.connect(gainU2);
        gainU2.connect(ctx.destination);
        oscU2.type = 'square';
        oscU2.frequency.setValueAtTime(800, t + 0.02);
        oscU2.frequency.exponentialRampToValueAtTime(200, t + 0.05);
        gainU2.gain.setValueAtTime(0, t + 0.02);
        gainU2.gain.linearRampToValueAtTime(0.2, t + 0.025);
        gainU2.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        
        osc.start(t); osc.stop(t + 0.05);
        oscU2.start(t + 0.02); oscU2.stop(t + 0.06);
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

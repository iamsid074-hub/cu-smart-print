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
      case 'tick':
        // Harder, sharper "TAN" tap synthesis
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // 2. Higher filter frequency for a sharper "TAN" hit
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t); // Increased from 400
        filter.Q.setValueAtTime(2, t); // Increased resonance for "TAN"

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t); // Increased volume
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        // 3. Sharper transient for immediate impact
        const transient = ctx.createOscillator();
        const transientGain = ctx.createGain();
        transient.connect(transientGain);
        transientGain.connect(ctx.destination);
        transient.type = 'square'; // Sharper than sine
        transient.frequency.setValueAtTime(1000, t);
        transientGain.gain.setValueAtTime(0, t);
        transientGain.gain.linearRampToValueAtTime(0.15, t + 0.001);
        transientGain.gain.exponentialRampToValueAtTime(0.01, t + 0.005);

        noise.start(t);
        noise.stop(t + 0.05);
        transient.start(t);
        transient.stop(t + 0.01);
        break;

      case 'unlock':
        // High-Fidelity Apple Pay / App Store Double-Chime
        // Note 1: E6 (~1318Hz) - The first part of the glassy ping
        const t1 = t;
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.51, t1);
        g1.gain.setValueAtTime(0, t1);
        g1.gain.linearRampToValueAtTime(0.4, t1 + 0.005);
        g1.gain.exponentialRampToValueAtTime(0.01, t1 + 0.5);
        osc1.connect(g1); g1.connect(ctx.destination);

        const harm1a = ctx.createOscillator();
        const gh1a = ctx.createGain();
        harm1a.type = 'sine';
        harm1a.frequency.setValueAtTime(2637.02, t1); // E7
        gh1a.gain.setValueAtTime(0, t1);
        gh1a.gain.linearRampToValueAtTime(0.15, t1 + 0.005);
        gh1a.gain.exponentialRampToValueAtTime(0.01, t1 + 0.3);
        harm1a.connect(gh1a); gh1a.connect(ctx.destination);

        // Note 2: G#6 (~1661Hz) - The second part of the double-chime
        const t2 = t + 0.12; // Precise 120ms delay
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1661.22, t2);
        g2.gain.setValueAtTime(0, t2);
        g2.gain.linearRampToValueAtTime(0.5, t2 + 0.005);
        g2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.6);
        osc2.connect(g2); g2.connect(ctx.destination);

        const harm2a = ctx.createOscillator();
        const gh2a = ctx.createGain();
        harm2a.type = 'sine';
        harm2a.frequency.setValueAtTime(3322.44, t2); // G#7
        gh2a.gain.setValueAtTime(0, t2);
        gh2a.gain.linearRampToValueAtTime(0.2, t2 + 0.005);
        gh2a.gain.exponentialRampToValueAtTime(0.01, t2 + 0.4);
        harm2a.connect(gh2a); gh2a.connect(ctx.destination);

        // Layer 5: Extremely high-frequency glassy "sparkle"
        const sparkle = ctx.createOscillator();
        const gSparkle = ctx.createGain();
        sparkle.type = 'triangle';
        sparkle.frequency.setValueAtTime(5274.04, t2); // E8
        gSparkle.gain.setValueAtTime(0, t2);
        gSparkle.gain.linearRampToValueAtTime(0.05, t2 + 0.005);
        gSparkle.gain.exponentialRampToValueAtTime(0.01, t2 + 0.2);
        sparkle.connect(gSparkle); gSparkle.connect(ctx.destination);

        osc1.start(t1); osc1.stop(t1 + 0.5);
        harm1a.start(t1); harm1a.stop(t1 + 0.3);
        osc2.start(t2); osc2.stop(t2 + 0.6);
        harm2a.start(t2); harm2a.stop(t2 + 0.4);
        sparkle.start(t2); sparkle.stop(t2 + 0.2);
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

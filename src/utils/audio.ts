/**
 * Gentle, peaceful procedural audio effects for bubbly interactions
 */
export function playBubbleSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    
    // Bubble pop pitch sweep: 300Hz -> 880Hz quickly
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(784, now + 0.12);
    
    // Smooth bubbly envelope
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Warm peaceful harmonic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25, now + 0.05); // C5
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
    gain2.gain.setValueAtTime(0.01, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.45);
  } catch {
    // AudioContext might be muted or not allowed prior to interaction
  }
}

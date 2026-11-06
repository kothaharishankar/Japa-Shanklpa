class FeedbackManager {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a subtle, soothing sacred singing-bowl / bead click chime
   */
  public playChime(isMalaCompletion = false) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      if (isMalaCompletion) {
        // Grand gentle bell chime on completing 108 repetitions
        const frequencies = [528, 660, 792]; // Harmonious sacred frequencies
        frequencies.forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.18, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

          osc.connect(gain);
          gain.connect(this.audioCtx!.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.85);
        });
      } else {
        // Gentle, soft wooden bead click / harmonic chime
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now); // 432 Hz healing vibration
        osc.frequency.exponentialRampToValueAtTime(216, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch {
      // Audio not permitted or supported; ignore safely
    }
  }

  /**
   * Haptic vibration
   */
  public vibrate(isMalaCompletion = false) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        if (isMalaCompletion) {
          navigator.vibrate([40, 60, 80]); // Distinct celebratory vibration
        } else {
          navigator.vibrate(12); // Subtle tap feedback
        }
      }
    } catch {
      // Ignore
    }
  }
}

export const feedback = new FeedbackManager();

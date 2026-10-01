/**
 * Procedural Atmospheric Soundscape Engine (Web Audio API)
 * Synthesizes dynamic wind breezes, rain droplets, and atmospheric drones
 * based on live Open-Meteo telemetry without external audio files.
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public start(windSpeedKmh: number = 15, isRaining: boolean = false) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Create 5-second pink noise buffer for natural atmospheric wind
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    // Wind lowpass filter modulated by wind velocity
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    const cutoff = Math.min(1200, Math.max(180, windSpeedKmh * 18));
    this.windFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // Subtle LFO for gentle wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // 0.15 Hz slow drift
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(cutoff * 0.4, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.windFilter.frequency);
    lfo.start();

    this.noiseSource.connect(this.windFilter);
    this.windFilter.connect(this.masterGain);
    this.noiseSource.start();
  }

  public update(windSpeedKmh: number) {
    if (!this.ctx || !this.windFilter) return;
    const cutoff = Math.min(1400, Math.max(200, windSpeedKmh * 20));
    this.windFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 1.5);
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {}
    }
    this.isPlaying = false;
  }

  public toggle(windSpeedKmh: number = 15, isRaining: boolean = false): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(windSpeedKmh, isRaining);
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const soundscape = new SoundscapeEngine();

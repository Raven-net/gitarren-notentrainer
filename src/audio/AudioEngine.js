export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyserNode = null;
    this.micStream = null;
    this.audioBuffer = null;
    this.sourceNode = null;
    this.currentDeviceType = null;
    this.isListening = false;
  }

  async initAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  async start(deviceType = 'irig') {
    await this.initAudioContext();

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
        latency: 0
      }
    };

    this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
    
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.audioBuffer = new Float32Array(this.analyserNode.fftSize);

    if (deviceType === 'mic') {
      // Bandpass-Filterung für Laptop-Mikrofon (Nebengeräusche dämpfen)
      const highPass = this.audioCtx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.setValueAtTime(75, this.audioCtx.currentTime);

      const lowPass = this.audioCtx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

      this.sourceNode.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(this.analyserNode);
    } else {
      // iRig HD 2: Direktes Signal
      this.sourceNode.connect(this.analyserNode);
    }

    this.currentDeviceType = deviceType;
    this.isListening = true;
    return {
      audioCtx: this.audioCtx,
      analyserNode: this.analyserNode,
      audioBuffer: this.audioBuffer
    };
  }

  getAudioData() {
    if (!this.analyserNode || !this.audioBuffer) return null;
    this.analyserNode.getFloatTimeDomainData(this.audioBuffer);
    return this.audioBuffer;
  }

  stop() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.isListening = false;
  }
}

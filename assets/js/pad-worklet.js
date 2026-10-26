/* pad-worklet.js: the pad's voices, generated on the audio
   thread (rebuild wave 6). An AudioWorklet processor, loaded by
   the sound module in assets/js/main.js through the platform's
   own addModule; it is this origin's file and makes no request
   of its own. Five voices stand here: the resting chord's four
   tones and, fifth, the Tide Chord's reckoned overtone. Each
   voice is a sine whose frequency, fullness and breathing are
   the numbers the sound module sends it, and the laws it keeps
   are the pad's own, the ones the oscillator path has kept
   since wave 8: a tone rises linearly to its fullness over its
   attack; a slow tremor breathes additively around that
   fullness; a retune glides exponentially with the same time
   constant the oscillators' setTargetAtTime keeps (1.2 s), so
   the two paths sing the same chord the same way; the
   overtone's gate opens and closes by the same exponential law
   at the time constant it is sent. Nothing here consults
   chance: the Reckoning's draws arrive as numbers, by message. */
class NinthPad extends AudioWorkletProcessor {
  constructor() {
    super();
    this.voices = [];
    for (let i = 0; i < 5; i++) {
      this.voices.push({
        on: false, freq: 0, target: 0, phase: 0, t: 0,
        base: 0, attack: 0, depth: 0, rate: 0,
        gate: i === 4 ? 0 : 1, gateTarget: i === 4 ? 0 : 1, gateTau: 1.5,
      });
    }
    this.port.onmessage = (e) => {
      const m = e.data || {}, v = this.voices[m.voice];
      if (!v) return;
      if (m.type === "start") {
        v.freq = v.target = m.cfg.freq;
        v.base = m.cfg.base; v.attack = m.cfg.attack;
        v.depth = m.cfg.depth; v.rate = m.cfg.rate;
        v.phase = 0; v.t = 0; v.on = true;
      } else if (m.type === "freq") {
        v.target = m.value;
      } else if (m.type === "gate") {
        v.gateTarget = m.value;
        v.gateTau = m.tau > 0 ? m.tau : 1.5;
      }
    };
  }
  process(inputs, outputs) {
    const glideK = 1 - Math.exp(-1 / (sampleRate * 1.2));
    for (let i = 0; i < this.voices.length; i++) {
      const v = this.voices[i], out = outputs[i] && outputs[i][0];
      if (!out) continue;
      if (!v.on) continue;
      const gateK = 1 - Math.exp(-1 / (sampleRate * v.gateTau));
      for (let s = 0; s < out.length; s++) {
        v.freq += (v.target - v.freq) * glideK;
        v.gate += (v.gateTarget - v.gate) * gateK;
        v.t += 1 / sampleRate;
        const risen = v.attack > 0 ? Math.min(1, v.t / v.attack) : 1;
        const g = v.gate * (v.base * risen + v.depth * Math.sin(2 * Math.PI * v.rate * v.t));
        v.phase += 2 * Math.PI * v.freq / sampleRate;
        out[s] = g * Math.sin(v.phase);
      }
    }
    return true;
  }
}
registerProcessor("ninth-pad", NinthPad);

function AudioEngine(params) {
    this.params = params;
    this.sink = null;
    this.lastOutput = 0;
    
    // constants
    this.maxFM = 1000;
    this.minFreq = 60;
    this.maxFreq = 5000;
    this.maxFilterFreq = 12000;
    this.outputMult = .5;
    
    // parameters (store again here as simple arrays instead of Backbone.Models for quick lookup)
    this.osc_freq = [];
    this.freq_mod = [];
    this.osc_amp = [];
    this.amp_mod = [];
    this.hpf = [];
    this.lpf = [];
    this.osc = 0;
    this.filter = 0;
    this.delay = 0;
    this.flow = 0;
    this.out = 0;
    
    // generators
    this.oscs = [];
    this.hpf_filters = [];
    this.lpf_filters = [];

    for (var i = 0; i < this.params.oscillatorCount; i++) {
        this.oscs.push(new Oscillator({
            sampleRate: this.params.sampleRate
        }));
        
        this.hpf_filters.push(new HighpassFilter({
            sampleRate: this.params.sampleRate
        }));

        this.lpf_filters.push(new LowpassFilter({
            sampleRate: this.params.sampleRate
        }));
        
        this.osc_freq.push(0);
        this.osc_amp.push(0);
        this.freq_mod.push(0);
        this.amp_mod.push(0);
        this.hpf.push(0);
        this.lpf.push(0);
    }
}

AudioEngine.prototype.setParameter = function(channel, name, value) {
    value = (value * value * value);
    
    switch(name) {
        case "osc_freq":
            this.osc_freq[channel] = (value * this.maxFreq) + this.minFreq;
            break;
        case "osc_amp":
            this.osc_amp[channel] = value;
            break;
        case "freq_mod":
            this.freq_mod[channel] = value * this.maxFM;
            break;
        case "amp_mod":
            this.amp_mod[channel] = value;
            break;
        case "lpf":
            this.lpf[channel] = (value * this.maxFilterFreq) + this.minFreq;
            break;
        case "hpf":
            this.hpf[channel] = (value * this.maxFilterFreq) + this.minFreq;
            break;
    }
}

AudioEngine.prototype.setGlobalParameter = function(name, value) {
    value = (value * value * value);
    
    switch(name) {
        case "osc":
        case "flow":
        case "filter":
        case "delay":
            this[name] = (value *.75) + .25;
            break;
        case "out":
            this.out = value;
            break;
    }
}

AudioEngine.prototype.init = function() {
    this.sink = Sink(this.processSamples.bind(this), 
                     this.params.channelCount, 
                     this.params.bufferSize, 
                     this.params.sampleRate);
}

AudioEngine.prototype.stop = function() {
    this.sink.kill();
    this.sink = null;
}

AudioEngine.prototype.processSamples = function(buffer, channelCount) {
    //var TEST = 0;
    for (var i = 0; i < buffer.length; i += channelCount) {
        var output = 0;
        
        for (var j = 0; j < this.oscs.length; j++) {
            var freq = this.osc_freq[j] + (this.freq_mod[j] * this.lastOutput * this.osc);
            var amp = this.osc_amp[j] + (this.amp_mod[j] * this.lastOutput * this.osc);
            var hpf_freq = (this.hpf[j] * this.filter);
            var lpf_freq = (this.lpf[j] * this.filter);
            //TEST = hpf_freq;
            var sample = this.oscs[j].processSample(freq) * amp;
            sample = this.hpf_filters[j].processSample(hpf_freq, sample);
            sample = this.lpf_filters[j].processSample(lpf_freq, sample);
            output += sample * this.outputMult;
        }
        
        for (var c = 0; c < channelCount; c++) {
            buffer[i + c] = output * this.out;
        }
        
        this.lastOutput = Math.abs(output);
    }
    //console.log(TEST)
}

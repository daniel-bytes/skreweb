function AudioEngine(params) {
    this.params = params;
    this.sink = null;
    this.lastOutput = 0;
    this.lastOutputs = [];
    
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
    this.delay = [];
    this.feedback = [];
    
    this.global_osc = 0;
    this.global_filter = 0;
    this.global_delay = 0;
    this.global_flow = 0;
    this.global_out = 0;
    
    // generators
    this.oscs = [];
    this.hpf_filters = [];
    this.lpf_filters = [];
    this.delays = [];

    for (var i = 0; i < this.params.oscillatorCount; i++) {
        this.lastOutputs.push(0);
        
        this.oscs.push(new Oscillator({
            sampleRate: this.params.sampleRate
        }));
        
        this.hpf_filters.push(new HighpassFilter({
            sampleRate: this.params.sampleRate
        }));

        this.lpf_filters.push(new LowpassFilter({
            sampleRate: this.params.sampleRate
        }));

        this.delays.push(new Delay({
            sampleRate: this.params.sampleRate
        }));
        
        this.osc_freq.push(0);
        this.osc_amp.push(0);
        this.freq_mod.push(0);
        this.amp_mod.push(0);
        this.hpf.push(0);
        this.lpf.push(0);
        this.delay.push(0);
    }
}

AudioEngine.prototype.setParameter = function(channel, name, value) {
    value = (value * value * value);
    
    switch(name) {
        case "osc_freq":
            value = (value * this.maxFreq) + this.minFreq;
            break;
        case "freq_mod":
            value = value * this.maxFM;
            break;
        case "lpf":
        case "hpf":
            value = (value * this.maxFilterFreq) + this.minFreq;
            break;
    }
    
    this[name][channel] = value;
}

AudioEngine.prototype.setGlobalParameter = function(name, value) {
    value = (value * value * value);
    
    switch(name) {
        case "osc":
        case "flow":
        case "filter":
        case "delay":
            value = (value *.75) + .25;
            break;
    }
    
    this["global_" + name] = value;
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
//    var TEST = 0;
    for (var i = 0; i < buffer.length; i += channelCount) {
        var output = 0;
        
        for (var j = 0; j < this.oscs.length; j++) {
            var freq = this.osc_freq[j] + (this.freq_mod[j] * this.lastOutput * this.global_osc);
            var amp = this.osc_amp[j] + (this.amp_mod[j] * this.lastOutput * this.global_osc);
            var hpf_freq = (this.hpf[j] * this.global_filter);
            var lpf_freq = (this.lpf[j] * this.global_filter);
            var delayTime = (this.delay[j] * this.global_delay);
            var feedback_amount = (this.feedback[j] * this.global_delay * this.global_flow);
            
//            TEST = delayTime;
            var sample = this.oscs[j].processSample(freq) * amp;
            sample = this.hpf_filters[j].processSample(hpf_freq, sample);
            sample = this.lpf_filters[j].processSample(lpf_freq, sample);
            sample = this.delays[j].processSample(delayTime, sample);
            sample = sample + (this.lastOutputs[j] * feedback_amount); // feedback
            
            output += sample * this.outputMult;

            this.lastOutputs[j] = sample;
        }
        
        for (var c = 0; c < channelCount; c++) {
            buffer[i + c] = output * this.global_out;
        }
        
        this.lastOutput = Math.abs((output * .5) + .5);
    }
//    console.log(TEST)
}

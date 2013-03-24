function AudioEngine(params) {
    this.params = params;
    this.sink = null;
    this.lastOutput = 0;
    this.maxFM = 1000;
    this.maxFreq = 5000;
    this.outputMult = .5;
    this.oscs = [];

    for (var i = 0; i < this.params.oscillatorCount; i++) {
        this.oscs.push(new Oscillator({
            sampleRate: this.params.sampleRate
        }));
    }
}

AudioEngine.prototype.setParameter = function(channel, name, value) {
    this.parameters[name][channel] = value;
}

AudioEngine.prototype.init = function() {
    this.sink = Sink(this.processSamples.bind(this), this.params.channelCount, this.params.bufferSize, this.params.sampleRate);
}

AudioEngine.prototype.processSamples = function(buffer, channelCount) {
    var outLevel = this.getExponentialValue(this.params.globalParameters.out, "value");
    
    for (var i = 0; i < buffer.length; i += channelCount) {
        var output = 0;
        
        for (var j = 0; j < this.oscs.length; j++) {
            var fm = this.getExponentialValue(this.params.parameters.freq_mod, "channel" + j);
            fm = (fm * this.maxFM * this.lastOutput);
            
            var level = this.getExponentialValue(this.params.parameters.osc_amp, "channel" + j);
            
            var freq = this.getExponentialValue(this.params.parameters.osc_freq, "channel" + j);
            freq = (freq * this.maxFreq) + fm;
            
            var sample = this.oscs[j].processSample(freq);
            output += (sample * level);
        }
        
        for (var c = 0; c < channelCount; c++) {
            buffer[i + c] = output * this.outputMult * outLevel;
        }
        
        this.lastOutput = Math.abs(output);
    }
}

AudioEngine.prototype.getExponentialValue = function(model, name) {
    var value = model.get(name);
    return (value * value * value);
}
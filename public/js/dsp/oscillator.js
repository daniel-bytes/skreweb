function Oscillator(params) {
    this.params = params;
    this.value = 0.0;
    this.baseIncrement = (1.0 / this.params.sampleRate);
}

Oscillator.prototype.processSample = function(frequency) {
    // calculate current phase
    var increment = this.baseIncrement * frequency;
    this.value += increment;
    
    if (this.value > 1.0) {
        this.value = 0.0;
    }
    
    // return oscillator value (just a square wave for now)
    return this.value > .5 ? 1.0 : -1.0;
}

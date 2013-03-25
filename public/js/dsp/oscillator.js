function Oscillator(params) {
    this.params = params;
    this.value = 0.0;
    this.lastFrequency = -1;
    this.increment = 0;
    
}

Oscillator.prototype.processSample = function(frequency) {
    // calculate current phase
    if (frequency !== this.lastFrequency) {
        this.calculateIncrement(frequency);
    }
    
    this.value += this.increment;
    
    if (this.value > 1.0) {
        this.value = 0.0;
    }
    
    // return oscillator value (just a square wave for now)
    return this.value > .5 ? 1.0 : -1.0;
}

Oscillator.prototype.calculateIncrement = function(frequency) {
    this.increment = (1.0 / this.params.sampleRate) * frequency;
    this.lastFrequency = frequency;
}

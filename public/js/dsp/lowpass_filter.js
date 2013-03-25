function LowpassFilter(params) {
    this.params = params;
    this.lastFrequency = null;
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.a0 = 0;
    this.a1 = 0;
    this.a2 = 0;
    this.xValues = [0, 0];
    this.yValues = [0, 0];
}

LowpassFilter.prototype.processSample = function(frequency, value) {
    if (frequency !== this.lastFrequency) {
        this.calculateCoefficients(frequency);
    }
    
    var x1 = this.xValues[0];
    var x2 = this.xValues[1];
    var y1 = this.yValues[0];
    var y2 = this.yValues[1];
    
    // calculate LPF
    x0 = value;
    y0 = (this.b0 / this.a0) * x0 +
         (this.b1 / this.a0) * x1 +
         (this.b2 / this.a0) * x2 -
         (this.a1 / this.a0) * y1 -
         (this.a2 / this.a0) * y2;
             
    this.xValues[0] = x0;
    this.xValues[1] = x1;
    this.yValues[0] = y0;
    this.yValues[1] = y1;
    
    return y0;
}

// algorithms taken from Audiolet (see also http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt)
LowpassFilter.prototype.calculateCoefficients = function(frequency) {
    var w0 = 2 * Math.PI * frequency / this.params.sampleRate;
    var cosw0 = Math.cos(w0);
    var sinw0 = Math.sin(w0);
    var alpha = sinw0 / (2 / Math.sqrt(2));

    this.b0 = (1 - cosw0) / 2;
    this.b1 = 1 - cosw0;
    this.b2 = this.b0;
    this.a0 = 1 + alpha;
    this.a1 = -2 * cosw0;
    this.a2 = 1 - alpha;
    
    this.lastFrequency = frequency;
}



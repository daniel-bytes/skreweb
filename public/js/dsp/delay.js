function Delay(params) {
    this.params = params;
    
    this.numSamples = params.sampleRate / 10;
    this.floatNumSamples = parseFloat(this.numSamples);
    this.buffer = [];
    this.writePos = 0;
    this.TEST = false;
    
    for (var i = 0; i < this.numSamples; i++) {
        this.buffer.push(0);
    }
}

Delay.prototype.processSample = function(delayTime, value) {
    if (this.writePos >= this.params.numSamples) {
        this.writePos = 0;
    }
    else {
        this.writePos++;
    }
    
    //if (!this.TEST) console.log("this.writePos: %i", this.writePos);
    
    this.buffer[this.writePos] = value;
    
    var offset = parseInt(this.floatNumSamples * delayTime);
    //if (!this.TEST) console.log("offset: %i", offset);
    var readPos = (this.writePos - offset);
    
    if (readPos < 0) {
        readPos += this.params.numSamples;
    }
    //if (!this.TEST) console.log("readPos: %i", readPos);
    //this.TEST = this.writePos > 5;
    return this.buffer[readPos];
}
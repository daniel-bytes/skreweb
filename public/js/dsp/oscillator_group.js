var OscillatorGroup = function(audiolet, params) {
    this.audiolet = audiolet;
    this.params = params;
    this.channels = [];
    this.mixers = [];
    
    AudioletGroup.apply(this, [this.audiolet, 1, 1]);
    
    var prev_node = null;
    
    for (var i = 0; i < params.length; i++) {
        var osc = new OscillatorChannel(this.audiolet, params[i]);
        this.channels.push(osc);
        
        if (i === 0) {
            prev_node = osc;
        }
        else {
            var mult = new Multiply(this.audiolet);
            this.mixers.push(mult);
            
            osc.connect(mult);
            prev_node.connect(mult, 0, 1);
            prev_node = mult;
        }
    }
    
    for (var i = 0; i < params.length; i++) {
        prev_node.connect(this.channels[i]);
    }
    
    prev_node.connect(this.outputs[0]);
    
    /*
    this.limiter = new Limiter(this.audiolet);
    prev_node.connect(this.limiter);
    this.limiter.connect(this.outputs[0]);
    */
}
extend(OscillatorGroup, AudioletGroup);

OscillatorGroup.prototype.setParameter = function(chan, name, p) {
    this.channels[chan].setParameter(name, p);
}
var OscillatorChannel = function(audiolet, params) {
    this.audiolet = audiolet;
    this.params = params;
    this.freq_table = [];
    
    var a = 440.0; // a is 440 hz...
    for (var x = 0; x <= 127; x++) {
       this.freq_table[x] = (a / 32.0) * Math.pow( (x - 9.0) / 12.0, 2.0 );
       console.log(this.freq_table[x])
    }
    
    AudioletGroup.apply(this, [this.audiolet, 1, 1]);

    var freq = this.calcFrequency(params.osc_freq);
    var lpffreq = this.calcFrequency(params.lpf);
    var hpffreq = this.calcFrequency(params.hpf);
    
    // setup parameter objects
    this.freq_mod_param = new ParameterNode(this.audiolet, params.freq_mod);
    this.osc_freq_param = new ParameterNode(this.audiolet, freq);
    this.amp_mod_param = new ParameterNode(this.audiolet, params.amp_mod);
    this.osc_amp_param = new ParameterNode(this.audiolet, params.osc_amp);
    this.hpf_param = new ParameterNode(this.audiolet, params.hpf);
    this.lpf_param = new ParameterNode(this.audiolet, params.lpf);
    this.delay_param = new ParameterNode(this.audiolet, params.delay);
    this.feedback_param = new ParameterNode(this.audiolet, params.feedback);
    
    this.freq_mod = this.freq_mod_param.parameter;
    this.osc_freq = this.osc_freq_param.parameter;
    this.amp_mod = this.amp_mod_param.parameter;
    this.osc_amp = this.osc_amp_param.parameter;
    this.hpf = this.hpf_param.parameter;
    this.lpf = this.lpf_param.parameter;
    this.delay = this.delay_param.parameter;
    this.feedback = this.feedback_param.parameter;
    
    // setup node objects
    this.square_node = new Square(this.audiolet, freq);
    this.freq_mod_mult_node = new MulAdd(this.audiolet);
    this.lowpass_node = new LowPassFilter(this.audiolet, lpffreq);
    this.highpass_node = new HighPassFilter(this.audiolet, hpffreq);
    this.gain_node = new Gain(this.audiolet, params.osc_amp);
    this.amp_mod_mult_node = new Multiply(this.audiolet);
    this.amp_mod_crossfade = new CrossFade(this.audiolet, params.amp_mod);
    this.delay_node = new FeedbackDelay(this.audiolet, 1.0, params.delay, params.feedback, .5);
    
    // connect parameters
    this.freq_mod_param.connect(this.freq_mod_mult_node, 0, 1);
    this.osc_freq_param.connect(this.freq_mod_mult_node, 0, 2);
    this.amp_mod_param.connect(this.amp_mod_crossfade, 0, 2);
    this.osc_amp_param.connect(this.gain_node, 0, 1);
    this.hpf_param.connect(this.highpass_node, 0, 1);
    this.lpf_param.connect(this.lowpass_node, 0, 1);
    this.delay_param.connect(this.delay_node, 0, 1);
    this.feedback_param.connect(this.delay_node, 0, 2);
    
    // connect nodes
    this.inputs[0].connect(this.freq_mod_mult_node);
    this.freq_mod_mult_node.connect(this.square_node);
    
    this.square_node.connect(this.gain_node);
    this.gain_node.connect(this.amp_mod_mult_node);
    this.inputs[0].connect(this.amp_mod_mult_node, 0, 1);
    this.square_node.connect(this.amp_mod_crossfade);
    this.amp_mod_mult_node.connect(this.amp_mod_crossfade, 0, 1);
    
    this.amp_mod_crossfade.connect(this.highpass_node);
    this.amp_mod_crossfade.connect(this.outputs[0]);
    /*
    this.amp_mod_crossfade.connect(this.highpass_node);
    this.highpass_node.connect(this.lowpass_node);
    this.lowpass_node.connect(this.delay_node);
    this.delay_node.connect(this.outputs[0]);
    */
}
extend(OscillatorChannel, AudioletGroup);

OscillatorChannel.prototype.setParameter = function(name, p) {
    if (name === "osc_freq" || name === "freq_mod" || name === "hpf" || name === "lpf") {
        p = this.calcFrequency(p);
    }
    
    this[name].setValue(p);
}

OscillatorChannel.prototype.calcFrequency = function(p) {
    var p = Math.min(parseInt(p * this.freq_table.length), 127);
    var f = this.freq_table[p];
    console.log("pitch: %s, freq: %s", p, f);
    return f;
}

function Application(params) {
    this.params = params;
}

Application.prototype.init = function() {
    var num_channels = 4;
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Configure Models
     */
    this.parameter_models = {
        osc_freq: new ParameterSetModel({ name: "osc_freq", channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        freq_mod: new ParameterSetModel({ name: "freq_mod", channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        osc_amp: new ParameterSetModel({  name: "osc_amp",  channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        amp_mod: new ParameterSetModel({  name: "amp_mod",  channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        hpf: new ParameterSetModel({      name: "hpf",      channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        lpf: new ParameterSetModel({      name: "lpf",      channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        delay: new ParameterSetModel({    name: "delay",    channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 }),
        feedback: new ParameterSetModel({ name: "feedback", channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 })
    };
    
    this.global_parameter_models = {
      osc: new GlobalParameterModel({    name: "osc",    value: .5 }),
      filter: new GlobalParameterModel({ name: "filter", value: .5 }),
      delay: new GlobalParameterModel({  name: "delay",  value: .25 }),
      flow: new GlobalParameterModel({   name: "flow",   value: .75 }),
      out: new GlobalParameterModel({    name: "out",    value: .9 })
    };
    
    this.selected_parameter_model = new ParameterSelectModel();
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Configure Views
     */
    this.parameter_select_view = new ParameterSelectView({ 
        model: this.selected_parameter_model, 
        el: this.params.parameter_select 
    });
    
    this.parameter_view = new ParameterSetView({ 
        el: this.params.parameter_set 
    });
    
    this.global_parameter_views = {
        osc: new GlobalParameterView({model: this.global_parameter_models.osc, el: this.params.global_parameter_osc}),
        filter: new GlobalParameterView({model: this.global_parameter_models.filter, el: this.params.global_parameter_filter}),
        delay: new GlobalParameterView({model: this.global_parameter_models.delay, el: this.params.global_parameter_delay}),
        flow: new GlobalParameterView({model: this.global_parameter_models.flow, el: this.params.global_parameter_flow}),
        out: new GlobalParameterView({model: this.global_parameter_models.out, el: this.params.global_parameter_out})
    };
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Configure DSP
     */
    this.bufferSize = 4096;
 	this.sampleRate = 44100;
 	this.audiolet = new Audiolet(this.sampleRate, 2, this.bufferSize);
 	
 	var group_params = [];
 	for (var i = 0; i < num_channels; i++) {
 	    group_params.push({
 	        osc_freq: this.parameter_models.osc_freq.get("channel" + i),
 	        freq_mod: this.parameter_models.freq_mod.get("channel" + i),
 	        osc_amp: this.parameter_models.osc_amp.get("channel" + i) * this.global_parameter_models.out.get("value"),
 	        amp_mod: this.parameter_models.amp_mod.get("channel" + i),
 	        hpf: this.parameter_models.hpf.get("channel" + i),
 	        lpf: this.parameter_models.lpf.get("channel" + i),
 	        delay: this.parameter_models.delay.get("channel" + i),
 	        feedback: this.parameter_models.feedback.get("channel" + i),
 	    });
 	}
 	
 	this.oscillator_group = new OscillatorGroup(this.audiolet, group_params);
 	this.oscillator_group.connect(this.audiolet.output);
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Configure Events
     */
    // when selected parameter model changes, update parameter set view
    this.selected_parameter_model.on("change", function(m) {
        var parameter_type = m.get("parameter");
        this.parameter_view.model = this.parameter_models[parameter_type];
        this.parameter_view.render();
    }.bind(this));
    
    // when parameter model value changes, update audio
    _(this.parameter_models).each(function(x) {
       x.on("parameter:change", function(args) {
           this.oscillator_group.setParameter(args.channel, args.name, args.value);
           //console.log("name: %s, channel: %i, value: %f", args.name, args.channel, args.value);
       }.bind(this))
    }.bind(this));
    
    // when global parameter model value changes, update audio
    _(this.global_parameter_models).each(function(x) {
        x.on("globalparameter:change", function(x) {
           console.log("global parameter.  name: %s, value: %f", x.name, x.value);
        }.bind(this));
    }.bind(this));
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Render / Init
     * -> setup first parameter select, which will cause other views to render correctly
     */
    var first_param = this.parameter_models.osc_freq.get("name");
    this.parameter_select_view.setParameterType(first_param);
}
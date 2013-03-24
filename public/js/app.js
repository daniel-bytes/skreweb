function Application(params) {
    this.params = params;
}

Application.prototype.init = function() {
    var num_channels = 8;
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Configure Models
     */
    this.parameter_models = {
        osc_freq: new ParameterSetModel(),
        freq_mod: new ParameterSetModel(),
        osc_amp: new ParameterSetModel(),
        amp_mod: new ParameterSetModel(),
        hpf: new ParameterSetModel(),
        lpf: new ParameterSetModel(),
        delay: new ParameterSetModel(),
        feedback: new ParameterSetModel()
    };
    
    this.global_parameter_models = {
      osc: new GlobalParameterModel(),
      filter: new GlobalParameterModel(),
      delay: new GlobalParameterModel(),
      flow: new GlobalParameterModel(),
      out: new GlobalParameterModel()
    };
    
    this.selected_parameter_model = new ParameterSelectModel();
    
    this.parameter_models.osc_freq.set({ name: "osc_freq", channel0: .03, channel1: .08, channel2: .1, channel3: .18, channel4: .27, channel5: .35, channel6: .5, channel7: .65 });
    this.parameter_models.freq_mod.set({ name: "freq_mod", channel0: .15, channel1: .95, channel2: .5, channel3: 0, channel4: .9, channel5: .05, channel6: .02, channel7: .1 });
    this.parameter_models.osc_amp.set({  name: "osc_amp",  channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    this.parameter_models.amp_mod.set({  name: "amp_mod",  channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    this.parameter_models.hpf.set({      name: "hpf",      channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    this.parameter_models.lpf.set({      name: "lpf",      channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    this.parameter_models.delay.set({    name: "delay",    channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    this.parameter_models.feedback.set({ name: "feedback", channel0: .5, channel1: .5, channel2: .5, channel3: .5, channel4: .5, channel5: .5, channel6: .5, channel7: .5 });
    
    this.global_parameter_models.osc.set({    name: "osc",    value: .5 });
    this.global_parameter_models.filter.set({ name: "filter", value: .5 });
    this.global_parameter_models.delay.set({  name: "delay",  value: .25 });
    this.global_parameter_models.flow.set({   name: "flow",   value: .75 });
    this.global_parameter_models.out.set({    name: "out",    value: .9 });
    
    
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
     this.channelCount = 2;
     this.bufferSize = 4096;
  	 this.sampleRate = 44100;
  	 
     this.audioEngine = new AudioEngine({
         channelCount: this.channelCount,
         bufferSize: this.bufferSize,
         sampleRate: this.sampleRate,
         oscillatorCount: num_channels,
         parameters: this.parameter_models,
         globalParameters: this.global_parameter_models
     });
     //this.audioEngine.init();

    
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
           console.log("parameter (name: %s, channel: %i, value: %f)", args.name, args.channel, args.value);
       }.bind(this))
    }.bind(this));
    
    // when global parameter model value changes, update audio
    _(this.global_parameter_models).each(function(x) {
        x.on("globalparameter:change", function(x) {
           console.log("global parameter (name: %s, value: %f)", x.name, x.value);
        }.bind(this));
    }.bind(this));
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
     * Render / Init
     * -> setup first parameter select, which will cause other views to render correctly
     */
    var first_param = this.parameter_models.osc_freq.get("name");
    this.parameter_select_view.setParameterType(first_param);
}
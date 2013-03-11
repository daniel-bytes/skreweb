function Application(params) {
    this.params = params;
}

Application.prototype.init = function() {
    /*
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
    
    this.selected_parameter_model = new ParameterSelectModel();
    
    
    /*
     * Configure Views
     */
    this.parameter_select_view = new ParameterSelectView({ 
        model: this.selected_parameter_model, 
        el: this.params.parameter_select 
    });
    
    this.parameter_view = new ParameterSetView({ 
        el: this.params.parameter_set 
    });
    
    
    /*
     * Configure Events
     */
     
    // when select parameter model changes, update parameter set view
    this.selected_parameter_model.on("change", function(m) {
        var parameter_type = m.get("parameter");
        this.parameter_view.model = this.parameter_models[parameter_type];
        this.parameter_view.render();
    }.bind(this));
    
    // when parameter model value changes, update audio
    _(this.parameter_models).each(function(x) {
       x.on("parameter:change", function(args) {
           console.log("name: %s, channel: %i, value: %f", args.name, args.channel, args.value);
       })
    });
    
    /*
     * Render
     * -> setup first parameter select, which will cause other views to render correctly
     */
    var first_param = this.parameter_models.osc_freq.get("name");
    this.parameter_select_view.setParameterType(first_param);
}
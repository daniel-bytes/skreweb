var GlobalParameterView = Backbone.View.extend({
    events: {
        "change": "change"
    },
    
    initialize: function() {
        _.bindAll(this, "change");
        
        this.$el.val(this.model.get("value") * 100);
        this.$el.knob();
    },
    
    change: function() {
        var value = parseFloat( this.$el.value / 100.0 );
        this.model.set("value", value, {silent:true});
        this.model.trigger("globalparameter:change", {name: this.model.get("name"), value: value});
    }
})
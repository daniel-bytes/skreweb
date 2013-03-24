var GlobalParameterView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, "change");
        
        this.$el.val(this.model.get("value") * 100);
        this.$el.knob({
            change: this.change
        });
    },
    
    change: function(val) {
        var value = parseFloat( val / 100.0 );
        this.model.set("value", value, {silent:true});
        this.model.trigger("globalparameter:change", {name: this.model.get("name"), value: value});
    }
})
var ParameterSelectView = Backbone.View.extend({
    events: {
        "click li": "elementClick"
    },
    
    initialize: function() {
        _.bindAll(this, "elementClick", "setParameterType");
    },
    
    elementClick: function(evt) {
        this.setParameterType(evt.target.id);
    },
    
    setParameterType: function(type) {
        this.$el.children("li").removeClass("selected");
        this.$el.children("li#" + type).addClass("selected");
        this.model.set("parameter", type);
    }
})
var GlobalParameterModel = Backbone.Model.extend({
    sendChangeEvents: function() {
        this.trigger("globalparameter:change", {name: this.get("name"), value: this.get("value")})
    }
})
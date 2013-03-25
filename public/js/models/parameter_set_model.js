var ParameterSetModel = Backbone.Model.extend({
    sendChangeEvents: function(num_channels) {
        for (var i = 0; i < num_channels; i++) {
            var value = this.get("channel" + i);
            this.trigger("parameter:change", {name: this.get("name"), channel: i, value: value})
        }
    }
});


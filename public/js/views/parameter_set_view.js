var ParameterSetView = Backbone.View.extend({
    events: {
        "mousedown": "mousedown",
        "mousemove": "mousemove"
    },
    
    initialize: function() {
        this.options.num_channels = 8;
        this.options.pressed = false;
        _.bindAll(this, "mousedown", "mousemove", "global_mouseup", "updateMousePosition", "refreshCanvas");
      
        this.$el.parents("html").mouseup(this.global_mouseup);
    },
    
    render: function() {
        this.refreshCanvas();
    },
    
    mousedown: function(evt) {
        this.options.pressed = true;
        this.updateMousePosition(evt);
        
        //this.model.trigger("change", this.model);
    },
    
    mousemove: function(evt) {
        if (this.options.pressed) {
            this.updateMousePosition(evt);
        }
    },
    
    global_mouseup: function(evt) {
        this.options.pressed = false;
    },
    
    updateMousePosition: function(evt) {
        var offset = this.$el.offset();
    	var x_click = parseInt(evt.pageX - offset.left);
    	var y_click = parseInt(evt.pageY - offset.top);
    	var width = this.$el.width();
    	var height = this.$el.height();
    	
    	var channel = parseInt( Math.max(0, Math.min(x_click / width, 1)) * 8 );
        var value = 1.0 - Math.max(0, Math.min(y_click / height, 1));
        
        this.model.set("channel" + channel, value, { silent: true } );
        this.model.trigger("parameter:change", { name: this.model.get("name"), channel: channel, value: value });
        
        this.refreshCanvas();
    },
    
    refreshCanvas: function() {
        var canv = this.$el;
        var ctxt = this.el.getContext("2d");
        var height = canv.height();
        var width = canv.width();
        
    	ctxt.clearRect(0, 0, width, height);
    	
    	for (var c = 0; c < this.options.num_channels; c++) {
    	    var value = parseFloat(this.model.get("channel" + c));
    	    if (isNaN(value)) value = 0;
    	    
    	    var padding = 5;
    	    
			var w = parseInt(width / this.options.num_channels);
			var h = parseInt(parseFloat(height) * (value));
			var x = (w * c);
			var y = height - h;
			
            ctxt.fillStyle = "#ff0";
    		ctxt.fillRect(x, y, w, h);
    		
			ctxt.fillStyle = "#000";
			ctxt.lineWidth = 3;
            ctxt.strokeRect(x, 0, w, height);
            
            ctxt.strokeRect(x, y, w, h);
    	}
    }
});
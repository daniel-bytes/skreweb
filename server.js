var express = require('express');
var app = express();
var port = parseInt(process.env.PORT, 10) || 3000;

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true, 
        showStack: true
        }));
        app.use(app.router);
});

app.get('/', function(req, res) {
    console.log("request path: /");
  
    console.log("- responding with view file views/index.html");
    res.sendfile("views/index.html");
});

app.listen(port);
console.log('Listening on port ' + port);

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.engine('mustache', (require('mustache-express'))());
app.engine('handlebars', require('express3-handlebars')({defaultLayout: 'main'}));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.set('host', process.env.HOST || 'http://localhost:3000');
app.use(express.favicon(__dirname + '/public/images/favicon.png'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/crap', routes.crap);
app.get('/share/:id', routes.share);
app.get('/image/(:id).png', routes.image);
app.get('/view/:id', routes.view);
app.get('/about', routes.about);
app.get('/reset', routes.reset);

http.createServer(app).listen(app.get('port'), "0.0.0.0", function(){
  console.log('Express server listening on port ' + app.get('port'));
});

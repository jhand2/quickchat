var http = require('http');
var routes = require('./app/routes');
// var user = require('./routes/user');
var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var dbConfig = require('./config/db')

var app = express();

var server = http.createServer(app);
var io = require('socket.io')(server);

app.set('port', process.env.port || 1337);
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.json());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

routes(app);

server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
	console.log('Connected user');

	mongo.connect(dbConfig.url, function (err, db) {
        var collection = db.collection('chat messages')
        var stream = collection.find().sort({ _id : -1 }).limit(10).stream();
        stream.on('data', function (chat) { socket.emit('chat', chat.content); });
    });

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('chat', function(msg) {
		socket.broadcast.emit('chat', msg);

		mongo.connect(dbConfig.url, function(err, db) {
			var collection = db.collection('chat_messages');
			collection.insert({ content: msg }, function(err, o) {
				if (err) { console.warn(err.message); }
				else { console.log('chat message added to db: ' + msg); }
			});
		});


	});
});
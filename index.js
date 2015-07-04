var restify = require("restify");
var restifyCookies = require("restify-cookies");
var mongodb = require("mongodb");
var API = require("./API");
var assert = require("assert");

mongodb.MongoClient.connect( "mongodb://localhost:27017/sous", function(err, db) {
	assert.ifError(err);

	var server = restify.createServer({
		name: "Sous",
		version: "1.0.0"
	});

	server.use(restify.bodyParser());

	server.use(restifyCookies.parse);

	new API(db, server);

	server.get(/\/app\/.*/, restify.serveStatic({
		directory: __dirname
	}));

	server.listen(8080, function() {
		console.log("Aww yeah, let's do this.");
	});
});

var path = require("path");
var fs = require("fs");

function API(dbConnection, server) {
	this.dbConnection = dbConnection;
	this.server = server;
	this.registerControllers("./controllers");
}

API.prototype.getDbConnection = function() {
	return this.dbConnection;
};

API.prototype.registerControllers = function(directory) {
	var api = this;
	fs.readdir(directory, function(err, files) {
		files.filter(looksLikeAJSFile).forEach(function(file) {
			var controller = require([directory, file].join(path.sep));
			new controller(api, api.server);
		});
	});
};

function looksLikeAJSFile(name) {
	return !!name.match(/\.js$/);
}

module.exports = API;

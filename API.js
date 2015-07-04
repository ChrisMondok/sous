var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var restify = require("restify");

//Generate a random key, keep it in memory
//Pros: there"s not a key stored somewhere
//Cons: restarting the server logs everyone out
var password = crypto.randomBytes(128);

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

API.prototype.encrypt = function(str) {
	var cipher = crypto.createCipher("aes-256-ctr", password);
	var encrypted = cipher.update(str, "utf8", "hex");
	encrypted += cipher["final"]("hex");
	return encrypted;
};

API.prototype.decrypt = function(str) {
	var decipher = crypto.createDecipher("aes-256-ctr", password);
	var decrypted = decipher.update(str, "hex", "utf8");
	decrypted += decipher["final"]("utf8");
	return decrypted;
};

API.prototype.authenticate = function(request, response, next) {
	var email = request.cookies.email;
	var secret = request.cookies.secret;

	try {
		if(this.decrypt(secret) == email && email)
			return next();
	}
	catch (e) {
		console.log("%s -> %s", email, e.toString());
	}
	
	return next(new restify.errors.UnauthorizedError());
};

function looksLikeAJSFile(name) {
	return !!name.match(/\.js$/);
}

module.exports = API;

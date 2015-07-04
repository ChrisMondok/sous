var http = require("http");
var restify = require("restify");
var assert = require("assert");

var audience = "http://10.0.0.4:8080";

var personaClient = restify.createJsonClient({
	url: "https://verifier.login.persona.org"
});

function AuthenticationController(api, server) {
	server.post("/api/authenticate", function(req, res, next) {
		verify(req.body).then(function(auth) {
			var secret = api.encrypt(auth.email);

			res.setCookie("email", auth.email);
			res.setCookie("secret", secret);

			res.json(200, {
				secret: secret,
				email: auth.email
			});

			return next();
		}, function(error) {

			res.setCookie("email", null);
			res.setCookie("secret", null);

			return next(restify.errors.UnauthorizedError(error));
		});
	});
}

function verify(assertion) {
	return new Promise(function(resolve, reject) {
		personaClient.post("/verify", {audience: audience, assertion: assertion}, function(err, req, res, model) {
			if(res.statusCode >= 200 && res.statusCode <= 300) {
				console.log("%j", model);
				if(model.status == "okay") {
					resolve(model);
					return;
				}
			}

			reject(model);
		});
	});
}

module.exports = AuthenticationController;

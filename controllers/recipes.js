var ObjectId = require("mongodb").ObjectId;
var assert = require("assert");

function RecipesController(api, server) {
	var recipes = api.getDbConnection().collection("recipes");

	server.get("/api/recipes", function(req, res, next) {
		var stream = recipes.find().stream();
		var results = [];
		stream.on("data", function(recipe) {results.push(recipe);});
		stream.on("end", function() {
			res.json(results);
			next();
		});
	});

	server.get("/api/recipes/:id", function(req, res, next) {
		recipes.findOne({_id: ObjectId(req.params.id)}, function(err, recipe) {
			assert.ifError(err);
			res.json(recipe ? 200 : 404, recipe);
			next();
		});
	});

	server.post("/api/recipes", function(req, res, next) {
		recipes.insert(req.body, function(err, result) {
			assert.ifError(err);
			res.json(result.ops[0]);
			return next();
		});
	});

	server.put("/api/recipes/:id", function(req, res, next) {
		delete req.body._id;

		recipes.update({_id: ObjectId(req.params.id)}, {$set: req.body}, function(err, result) {
			assert.ifError(err);

			res.send(result.result.n ? 204 : 404);

			next();
		});
	});

	server.del("/api/recipes/:id", function(req, res, next) {
		var result = recipes.remove({_id: ObjectId(req.params.id)}, { justOne: true }, function(err, result) {
			assert.ifError(err);

			res.send(result.result.n ? 204 : 404);

			next();
		});
	});
}

module.exports = RecipesController;

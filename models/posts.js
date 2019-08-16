var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    description: String,
    image: String
});


module.exports = mongoose.model("Post", postSchema);
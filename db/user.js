'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var userSchema = mongoose.Schema({ 
  userAlias: {type: String, required: true}, // 
});

var User = mongoose.model("user", userSchema);

module.exports = User;
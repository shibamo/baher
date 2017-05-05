'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var listItemSchema = mongoose.Schema({ 
  userAlias: {type: String, required: true}, // 
  itemName: {type: String, required: true}, //
  itemCount: {type: Number, required: true}, //
});

var ListItem = mongoose.model("listItem", listItemSchema);

module.exports = ListItem;
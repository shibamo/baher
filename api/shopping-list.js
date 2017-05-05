'use strict';
const colors = require('colors');
const express = require("express");

// Import the Data/DB interface
var User = require(process.cwd() + "/db/user");
var ListItem = require(process.cwd() + "/db/item");

const Lib = require(process.cwd() + "/lib");

//Init Router
const api = express.Router();

api.post("/new_user", (req, res) => {
  Lib.newUser(
    req.body.userAlias,
    (success, _user)=>{
    res.send({success: success, user: _user});
  });
});

api.post("/old_user", (req, res) => {
  Lib.oldUser(
    req.body.userAlias,
    (_user)=>{
    res.send(_user);
  });
});

api.post("/users", (req, res) => {
  Lib.users(
    (users)=>{
      res.send(users);
  });
});

api.post("/new_list_item", (req, res) => {
  Lib.newListItem(
    req.body.userAlias,
    req.body.itemName,
    req.body.itemCount,
    (_listItem)=>{
    res.send(_listItem);
  });
});

api.post("/list_items", (req, res) => {
  Lib.listItems(
    (_listItems)=>{
      res.send(_listItems);
  });
});

api.post("/update_list_item", (req, res) => {
  Lib.updateListItem(
    req.body.listItemId,
    req.body.itemName,
    req.body.itemCount,
    req.body.userAlias,
    (isSuccess, result)=>{
      res.send([isSuccess,result]);
  });
});

module.exports = api;
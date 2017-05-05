'use strict';
const c = require('./common');
const colors = require('colors');

const User = require(process.cwd() + "/db/user");
const ListItem = require(process.cwd() + "/db/item");


function newUser(userAlias, callback){
  User.findOne({userAlias: userAlias})
  .then(_user =>{
    if(_user && _user._id) {
      callback(false,null);
    } else{
      let user = new User();
      user.userAlias = userAlias;

      user.save(function (err) {
        if(err){
          console.log(err);
          callback(false,null);
          return;
        }
      })
      .then(()=>{
        User.findOne({_id: user._id})
        .exec(function(err,_user){
          callback(true,_user);
        });
      });
    }
  });
}

function oldUser(userAlias, callback){
  let user = new User();
  user.userAlias = userAlias;

  User.findOne({userAlias: userAlias})
  .exec(function(err,_user){
    callback(_user);
  });
}

function users(callback){
  User.find({})
  .exec(function(err,users){
    callback(users);
  });
}

function newListItem(userAlias, itemName, itemCount,callback){
  let listItem = new ListItem();
  listItem.userAlias = userAlias;
  listItem.itemName = itemName;
  listItem.itemCount = itemCount;    

  listItem.save(function (err) {
    if(err){
      console.log(err);
      return;
    }
  })
  .then(()=>{
    ListItem.findOne({_id: listItem._id})
    .exec(function(err,_listItem){
      callback(_listItem);
    });
  });  
}

function listItems(callback){
  ListItem.find({})
  .exec(function(err,_listItems){
    callback(_listItems);
  });
}

function updateListItem(listItemId, itemName, itemCount,userAlias,callback){
  ListItem.update(
    { _id: listItemId }, 
    { itemName: itemName, itemCount: itemCount, userAlias: userAlias}, 
    { multi: true }, 
    function (err, raw) {
      if (err) {
        console.log(err);
        callback(false, err.toString());
        return;
      }
      else {
        console.log('The raw response from Mongo was ', raw);
        callback(true,raw);
      }
  });
}

module.exports = {
  newUser,
  oldUser,
  users,
  newListItem,
  updateListItem,
  listItems
};
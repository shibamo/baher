const v = new Vue({
  el: '#app',
  data: {
    userId: null,
    userAlias:null,
    listItems: [],
    urlPath: 'api/shopping-list/',
    socket: io(),
    dialogFormVisible: false,
    currentItem: {
      itemName: null,
      itemCount: 0,
      itemId: null, 
    },
  },
  computed:{
    isInList: function(){
      return this.userId != null;
    },
  },
  methods: {
    joinDlg(){
      this.dialogFormVisible = true;
      this.userAlias = this.socket.id.toString().substring(0,6);
    },

    joinNewUser(){
      this.dialogFormVisible = false;
      let that = this;

      axios.post(that.urlPath + "new_user",
      {
        userAlias: that.userAlias,
      })
      .then(function (response) {
        let success = response.data.success;
        if(success){
          let _user = response.data.user;
          that.userId = _user._id;
          that.storeInfo();
          that.socket.emit('user created',that.userAlias,that.userId);        
          that.socket.emit('enter user',that.userAlias,that.userId);
          that.$message.success({
            title: 'success',
            message: 'Success joined into list',
            offset: 100
          });
          that.getListItems();
        }else{
          that.$message.error({
            title: 'error',
            message: 'Cannot create user:' + that.userAlias + ', maybe already exists.',
            offset: 100
          });
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    },

    joinOldUser(){
      this.dialogFormVisible = false;
      let that = this;

      axios.post(that.urlPath + "old_user",
      {
        userAlias: that.userAlias,
      })
      .then(function (response) {
        let _user = response.data;
        if(_user._id){
          that.userId = _user._id;
          that.storeInfo();
          that.socket.emit('enter user',that.userAlias,that.userId);
          that.$message.success({
            title: 'success',
            message: 'Success joined into list.',
            offset: 100
          });
          that.getListItems();
        }else{
          that.$message.error({
            title: 'error',
            message: 'User ' + that.userAlias + ' not exists.',
            offset: 100
          });
          that.userId = null;
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    },

    exit(){
      this.clearInfo();
    },

    newListItem(){
      let that = this;
      axios.post(that.urlPath + "new_list_item",
      {
        userId: that.userId,
        itemName: that.currentItem.itemName,
        itemCount: that.currentItem.itemCount,
        userAlias: that.userAlias
      })
      .then(function (response) {
        let _listItem = response.data;
        that.listItems.push(_listItem);
        that.socket.emit('list updated',that.userAlias);
        that.$message.success({
          title: 'success',
          message: 'Success added into shopping list.',
          offset: 100
        });
      })
      .catch(function (error) {
        console.error(error);
      });
    },

    updateListItem(){
      let that = this;
      axios.post(that.urlPath + "update_list_item",
      {
        itemName: that.currentItem.itemName,
        itemCount: that.currentItem.itemCount,
        listItemId: that.currentItem.itemId,
        userAlias: that.userAlias        
      })
      .then(function (response) {
        if(response.data[0]){
          let listItem = that.listItems.find(
            (item)=>item._id==that.currentItem.itemId);
          listItem.itemName = that.currentItem.itemName;
          listItem.itemCount = that.currentItem.itemCount;
          listItem.userAlias = that.userAlias;
          that.socket.emit('list updated',that.userAlias);
          that.$message.success({
            title: 'success',
            message: 'Success updated shopping list item.',
            offset: 100
          });
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    },

    handleCurrentChange(val){
      if(val){
        this.currentItem.itemName = val.itemName;
        this.currentItem.itemCount= val.itemCount;
        this.currentItem.itemId= val._id;
      }else{
        this.currentItem = {
          itemName: null,
          itemCount: 0,
          itemId: null, 
        };
      }
    },

    getListItems(){
      const that = this;
      return axios.post(this.urlPath + "list_items",{})
      .then(function (response) {
        that.listItems = response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
    },

    loadInfo(){
      return {
        userId: localStorage.getItem("userId"),
        userAlias: localStorage.getItem("userAlias")
      };
    },
    storeInfo(){
      localStorage.setItem("userId",this.userId);
      localStorage.setItem("userAlias",this.userAlias);
    },
    clearInfo(){
      localStorage.removeItem("userId");
      localStorage.removeItem("userAlias");
      this.listItems = null;
      this.userId = null;
      this.userAlias = null;
      this.currentItem = {
        itemName: null,
        itemCount: 0,
        itemId: null, 
      };
    },
  },
  mounted() {
    const that = this;
    let _info = this.loadInfo();

    if(_info.userId){
      this.userId = _info.userId;
      this.userAlias = _info.userAlias;
      this.socket.emit('enter user',_info.userAlias,_info.userId);
      this.getListItems();
    }

    this.socket.on('list updated', function (data) {
      that.$message.warning({
        title: 'Shopping list change',
        message: data.userAlias + ' updated shopping list item.',
        offset: 100
      });
      that.getListItems();
    });

    this.socket.on('user created', function (data) {
      that.$message.info({
        title: 'New user created',
        message: data.userAlias + ' created.',
        offset: 100
      });
    });

    this.socket.on('list items', function (data) {
      that.listItems = data;
      console.log(data);
    });
  }
});
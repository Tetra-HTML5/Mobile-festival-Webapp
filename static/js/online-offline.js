Lungo.dom('#main').on('load', function(event){

  //if (Lungo.Cache.get("onload") == 1){
    var userData = Lungo.Cache.get("userdata");
    var myConnectionsRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userData.id+'/connections');
    var lastOnlineRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userData.id+'/lastOnline');
    var connectedRef = new Firebase('https://festivalapp.firebaseio.com/.info/connected');
    connectedRef.on('value', function(snap) {
      //console.log(snap.val());
      if (snap.val() === true) {
        var con = myConnectionsRef.push(true);
        con.onDisconnect().remove();
        lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      }
    });
  //}
  Lungo.Cache.set("onload", 1);
  }).on('unload',function(event){
    Lungo.Cache.remove("onload");
});
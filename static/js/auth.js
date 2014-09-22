function gplus_auth(){

  var loginFinished = function(authResult) {

    if (authResult['status']['signed_in']) {
      gapi.client.load('plus','v1', function(){
        var request = gapi.client.plus.people.get({
        'userId': 'me'
      });
      request.execute(function(resp) {
        //console.log(resp);
        var id = resp.id;
        //var name = resp.name.givenName;
        var name = resp.displayName;
        var image = resp.image.url;
        var user = {id: id, name: name, image: image};

        var userRef = new Firebase('https://festivalapp.firebaseio.com/users/'+id);
        userRef.child('name').set(name);
        userRef.child('image').set(image);
        userRef.child('id').set(id);

        Lungo.Cache.set("userdata", user);
        Lungo.Router.section("main");
      });
    });
    } else {
      console.log(authResult['error']);
    }
  };

  var options = {
    'callback' : loginFinished,
    'approvalprompt' : 'auto',
    'clientid' : '130965801972-a6b84s35273rql7on9clm3gru5c52jda.apps.googleusercontent.com',
    'scope' : 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/plus.login',
    'requestvisibleactions' : 'http://schemas.google.com/CommentActivity http://schemas.google.com/ReviewActivity',
    'cookiepolicy' : 'single_host_origin'
  };

  gapi.auth.signIn(options);
}
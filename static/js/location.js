Lungo.dom('#main').on('load', function(event){
      var optn = { enableHighAccuracy: true, timeout: Infinity, maximumAge: 0  };
      if( navigator.geolocation ){
        navigator.geolocation.watchPosition(success, fail, optn);
      }  
      else{
        $("#warning").html("HTML5 Not Supported");
      }
      
      function success(position){
        var userData = Lungo.Cache.get("userdata");
        var locationRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userData.id+'/location');
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        locationRef.child('latitude').set(lat);
        locationRef.child('longitude').set(lng);
        console.log('position saved');

      }
      function fail(error){
        var errorType={
          0:"Unknown Error",
          1:"Permission denied by the user",
          2:"Position of the user not available",
          3:"Request timed out"
        };
        var errMsg = errorType[error.code];
        if(error.code == 0 || error.code == 2){
          errMsg = errMsg+" - "+error.message;
        }
        $("#warning").html(errMsg);
      }
});

Lungo.dom('#friendlocation').on('load', function(event){  
  var map;
  var userData = Lungo.Cache.get("userdata");
  var myid = userData.id;
  var userRef = new Firebase('https://festivalapp.firebaseio.com/users/'+myid+'/location/');
  userRef.on('value', function(data) {
    var cords = data.val();
    var myLatlng = new google.maps.LatLng(cords.latitude,cords.longitude);
    var mapOptions = {
      zoom: 20,
      center: myLatlng
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'You'
    });

    var userRef = new Firebase('https://festivalapp.firebaseio.com/users');
    userRef.on('value', function(data) {
      var userids = Object.keys(data.val());

      $.each(userids, function( index, value ) {
        //console.log( index + ": " + value );
        var cordsRef = new Firebase('https://festivalapp.firebaseio.com/users/'+value+'/location/');
        var userRef = new Firebase('https://festivalapp.firebaseio.com/users/'+value+'/image/');

        cordsRef.once('value', function(data) {
          var cords = data.val();
          
          if (cords){
            //console.log(cords);
            if (value != myid){
              userRef.once('value', function(data) {
                var image = data.val();
                var newLatlng = new google.maps.LatLng(cords.latitude,cords.longitude);
                var marker = new google.maps.Marker({
                  position: newLatlng,
                  map: map,
                  title: 'User',
                  icon: image
                });
              });
            }
          }
        });
      });
    });
  });
});
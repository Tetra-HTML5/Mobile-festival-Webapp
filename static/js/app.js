//disable rubberband effect on mobile browsers
$('body').on('touchmove', function (e) {
    var searchTerms = '.scroll, .scroll-y, .scroll-x',
    $target = $(e.target),
    parents = $target.parents(searchTerms);

    if (parents.length || $target.hasClass(searchTerms)) {
// ignore as we want the scroll to happen
} else {
    e.preventDefault();
}
});


Lungo.dom('#triggerSignIn').tap(function(event) {
    //static/js/auth.js
    gplus_auth();
});


Lungo.dom('#signout').tap(function(event) {
    var userData = Lungo.Cache.get("userdata");
    var connectedRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userData.id+'/connections');
    var lastOnlineRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userData.id+'/lastOnline');
    connectedRef.remove();
    lastOnlineRef.set(Firebase.ServerValue.TIMESTAMP);
    gapi.auth.signOut();
	Lungo.Router.section("splash");
	Lungo.Cache.remove("userdata");
});

Lungo.dom('#splash').on('load', function(event){
    Lungo.Cache.set("active", {status: "Splash"});
    Lungo.Cache.set("time", {timestamp: new Date().getTime()});
});


Lungo.dom('#main').on('load', function(event){
    if (Lungo.Cache.get("onload") == 1){
        notifactionslistener();
        Lungo.Cache.set("active", {status: "Active"});
	    var userData = Lungo.Cache.get("userdata");
        $("#userImg").attr("src", userData.image);
        $("#userName").text("Welcome " + userData.name);
    }
    Lungo.Cache.set("onload", 1);
    }).on('unload',function(event){
        Lungo.Cache.remove("onload");
});


Lungo.dom('#feed').on('load', function(event){
	if (Lungo.Cache.get("onload") == 1){
        notifactionslistener();
		$('#feeditems').empty();
	}
	Lungo.Cache.set("onload", 1);
	
	}).on('unload',function(event){
		Lungo.Cache.remove("onload");
});


Lungo.dom('#users').on('load', function(event){
        notifactionslistener();
    	$('#frienditems').empty();
    	var userRef = new Firebase('https://festivalapp.firebaseio.com/users');

    	userRef.on('child_added', function(snapshot) {
            var userData = Lungo.Cache.get("userdata");
            var userInfo = snapshot.val();
            var status = '';
            
            
            if( userInfo.connections){ status = '<span class="online">Online</span>' }
            else { status = 'Last Online: '+userInfo.lastOnline; }

            if( userInfo.id == userData.id){ follow = '<a href="#" class="button small on-right" disabled="true">You</a>'; }
            else {
                follow = '<a href="#" class="button small on-right followbtn" data-label="Follow" data-id="'+userInfo.id+'"><abbr>Follow</abbr></a>';
            }

            var html = '<li class="thumb"><img src="'+userInfo.image+'"><div>'+follow+'<strong>'+userInfo.name+'</strong><small>'+status+'</small></div></li>';
        	$('#frienditems').prepend(html);
        });
});


Lungo.dom('.followbtn').tap(function(event) {
    var userData = Lungo.Cache.get("userdata");
    var userId = userData.id;
    var followid = $(this).data("id");
    var userRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/following/');
    userRef.push({'id' : followid});
});



Lungo.dom('#feed').on('load', function(event){
    if (Lungo.Cache.get("onload") == 1){
            notifactionslistener();
            $('#feeditems').empty();

            statusref = new Firebase('https://festivalapp.firebaseio.com/status/');
            statusref.on('child_added', function(snapshot) {
                var statusInfo = snapshot.val();
                //console.log(statusInfo);
                var html = '<li class="thumb"><img src="'+statusInfo.image+'"><div><div class="on-right text tiny">'+statusInfo.timestamp+'</div><strong>'+statusInfo.name+'</strong><small>'+statusInfo.status+'</small></div></li>';
                $('#feeditems').prepend(html);
            });


    }
    Lungo.Cache.set("onload", 1);
    
    }).on('unload',function(event){
        Lungo.Cache.remove("onload");
});




Lungo.dom('#postmessage').on('load', function(event){
    notifactionslistener();
	Lungo.dom('#post-status').tap(function(event){
        var status = $('#status').val();
        var userData = Lungo.Cache.get("userdata");
        var userId = userData.id;
        var timestamp = event.timeStamp;
        var userRef = new Firebase('https://festivalapp.firebaseio.com/status/');
        var newPushRef = userRef.push();
        newPushRef.set({id: userId, timestamp:timestamp, status: status, image: userData.image, name: userData.name});
   
        newPushRef.on('child_added', function(snapshot) {
            $('#status').val('');
            Lungo.Router.article("feed", "feedlist");
        });   
    });
});




Lungo.dom('#video').on('load', function(event){
    notifactionslistener();
    //if (Lungo.Cache.get("onload") == 1){
        $('#videos').empty();
        var userData = Lungo.Cache.get("userdata");
        var userId = userData.id;
        var videosRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/videos/');
        var accessToken = gapi.auth.getToken();
        //console.log (accessToken);
        videosRef.on('child_added', function(snapshot) {
            var videoInfo = snapshot.val();
            console.log(videoInfo);
            var html ='<iframe title="YouTube video player" class="youtube-player" type="text/html" width="100%" height="" src="http://www.youtube.com/embed/'+videoInfo.video+'?showinfo=0&rel=0&showinfo=0&modestbranding=1" frameborder="0" allowFullScreen></iframe>';
            //$('#videos').append('<li><a href="http://youtube.com/watch?v='+videoInfo.video+'">'+videoInfo.video+'</a></li>');
            $('#videos').append('<li>'+html+'</li>');


            var status = '<a href="http://www.youtube.com/embed/'+videoInfo.video+'?showinfo=0&rel=0&showinfo=0&modestbranding=1">added a video</a>';
            var timestamp = Firebase.ServerValue.TIMESTAMP;
            var userRef = new Firebase('https://festivalapp.firebaseio.com/status/');
            var newPushRef = userRef.push();
            newPushRef.set({id: userId, timestamp:timestamp, status: status, image: userData.image, name: userData.name});

        });
    //}
    Lungo.Cache.set("onload", 1);

}).on('unload',function(event){
   Lungo.Cache.remove("onload");
});



Lungo.dom('#videoupload').on('load', function(event){
    notifactionslistener();
    $("#fileSelect").show();
    $("#fileUpload").hide();
    $("#uploadprogress").hide();
    $( "#fileSelect" ).click(function() {
       $( "#fileElem").click();
    });
    
    $( "#fileElem" ).change(function() {
        //var file = this.files;
        $("#fileSelect").hide();
        $("#fileUpload").show();
    });

    $( "#fileUpload" ).click(function() {
       $( "#fileUpload").hide();
       $( "#upload-form" ).submit();
       $( "#uploadprogress").show();
   });
});



Lungo.dom('#notifications').on('load', function(event){
    if (Lungo.Cache.get("onload") == 1){
        notifactionslistener();
        $('#messages').empty();
        var userData = Lungo.Cache.get("userdata");
        var userId = userData.id;
        var messageListRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/notifications');
        messageListRef.on('child_added', function(allMessagesSnapshot) {
            //allMessagesSnapshot.forEach(function(messageSnapshot) {
                var title = allMessagesSnapshot.child('title').val();
                var mydescripion = allMessagesSnapshot.child('description').val();
                var timestap = allMessagesSnapshot.child('timestamp').val();
                var name = allMessagesSnapshot.name();
                $('#messages').append('<li class="notificaton" data-id="'+name+'"><div class="on-right ">'+timestap+'</div><strong class="text bold">'+title+'</strong><div class="text small">'+mydescripion+'</div></li>');
            //});
        });    
    }
    Lungo.Cache.set("onload", 1);
}).on('unload',function(event){
   Lungo.Cache.remove("onload");
});



function notifactionslistener(){ 
    var userData = Lungo.Cache.get("userdata");
    var userId = userData.id;
    var notificationRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/notifications');

    notificationRef.on('child_added', function(data) {
        var title = data.val().title;
        var descripion = data.val().description;
        var timestamp = data.val().timestamp;
        var appstatus = Lungo.Cache.get("active");
        var apptime = Lungo.Cache.get("time");

        if (appstatus.status == "Active" && !(timestamp < apptime.timestamp)){
            Lungo.Notification.confirm({
                icon: 'info-sign',
                title: title,
                description: descripion,
                accept: {
                    icon: 'checkmark',
                    label: 'Close',
                    callback: function(){ Lungo.Cache.set("time", {timestamp: new Date().getTime()}); }
                },
                cancel: {
                    icon: 'close',
                    label: ''
                }
            });
        }

        notificationRef.once('value', function(data) {
            $( "#notificationnumber").html(data.numChildren());
        });
    });

    notificationRef.on('child_removed', function(data) {
        //console.log(data.name());
        //$('li[data-id="' + data.name() +'"]').remove();
        $('li[data-id="' + data.name() +'"]').fadeOut('slow', function(){
            $(this).remove();

        });
    });
}



Lungo.dom('.notificaton').swipeLeft(function(event) {
    var messageid = $(this).data("id");
    //console.log(messageid);
    var userData = Lungo.Cache.get("userdata");
    var userId = userData.id;
    var notificationRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/notifications/'+messageid);
    notificationRef.remove();
    var notificationnumbers = $("#notificationnumber").html();
    $( "#notificationnumber").html(notificationnumbers -1);
    
});





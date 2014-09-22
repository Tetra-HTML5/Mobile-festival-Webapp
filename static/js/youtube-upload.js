	
	//var GOOGLE_PLUS_SCRIPT_URL = 'https://apis.google.com/js/client:plusone.js';
	var CHANNELS_SERVICE_URL = 'https://www.googleapis.com/youtube/v3/channels';
	var VIDEOS_UPLOAD_SERVICE_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet';
	var VIDEOS_SERVICE_URL = 'https://www.googleapis.com/youtube/v3/videos';
	var INITIAL_STATUS_POLLING_INTERVAL_MS = 15 * 1000;
	
	  
	//console.log(accessToken.access_token);

	    // $.ajax({
	    //     url: CHANNELS_SERVICE_URL,
	    //     method: 'GET',
	    //     headers: {
	    //       Authorization: 'Bearer ' + accessToken.access_token
	    //     },
	    //     data: {
	    //       part: 'snippet',
	    //       mine: true
	    //     }
	    //   }).done(function(response) {
	    //     //console.log(response)
	    //   });

	$( "#upload-form" ).submit(function( event ) {
  		event.preventDefault();
		//console.log('form submitted');
	    var accessToken = gapi.auth.getToken();
		var file = $('#fileElem').get(0).files[0];
		//console.log(file);
		if (file) {
	      var metadata = {
	        snippet: {
	          title: $('#title').val(),
	          description: $('#description').val(),
	          categoryId: 22
	        }
	      };
	  	
	      $.ajax({
        	url: VIDEOS_UPLOAD_SERVICE_URL,
        	method: 'POST',
        	contentType: 'application/json',
        	headers: {
          	Authorization: 'Bearer ' + accessToken.access_token,
          	'x-upload-content-length': file.size,
          	'x-upload-content-type': file.type
        	},
        	data: JSON.stringify(metadata)
      		}).done(function(data, textStatus, jqXHR) {
        		resumableUpload({
          			url: jqXHR.getResponseHeader('Location'),
          			file: file,
          			start: 0
        		});
      		});
	  	}

	function resumableUpload(options) {
    var ajax = $.ajax({
      url: options.url,
      method: 'PUT',
      contentType: options.file.type,
      headers: {
        'Content-Range': 'bytes ' + options.start + '-' + (options.file.size - 1) + '/' + options.file.size
      },
      xhr: function() {
        // Thanks to http://stackoverflow.com/a/8758614/385997
        var xhr = $.ajaxSettings.xhr();

        if (xhr.upload) {
          xhr.upload.addEventListener(
            'progress',
            function(e) {
              if(e.lengthComputable) {
                var bytesTransferred = e.loaded;
                var totalBytes = e.total;
                var percentage = Math.round(100 * bytesTransferred / totalBytes);

                Lungo.Element.progress("#uploadprogress", percentage, true);
                // $('#upload-progress').attr({
                //   value: bytesTransferred,
                //   max: totalBytes
                // });

                // $('#percent-transferred').text(percentage);
                // $('#bytes-transferred').text(bytesTransferred);
                // $('#total-bytes').text(totalBytes);

                // $('.during-upload').show();
              }
            },
            false
          );
        }

        return xhr;
      },
      processData: false,
      data: options.file
    });

    ajax.done(function(response) {
      
      var userData = Lungo.Cache.get("userdata");	
      var userId = userData.id;
      var title = $('#title').val();
	  var description = $('#description').val();
	  //var embedhtml = response.items[0].player.embedHtml;
      console.log(response);
      var videoId = response.id;
      var videoRef = new Firebase('https://festivalapp.firebaseio.com/users/'+userId+'/videos/');
      var videoPushRef = videoRef.push();
      videoPushRef.update({video : videoId, title : title, description : description});
      checkVideoStatus(videoId, INITIAL_STATUS_POLLING_INTERVAL_MS);
    });

    ajax.fail(function() {
      $('#fileUpload').click(function() {
        alert('Not yet implemented!');
      });
      $("#fileUpload").show();
      $('#fileUpload').val('Resume Upload');
    });
  }

  function checkVideoStatus(videoId, waitForNextPoll) {
    $.ajax({
      url: VIDEOS_SERVICE_URL,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken.access_token
      },
      data: {
        part: 'status,processingDetails,player',
        id: videoId
      }
    }).done(function(response) {

    	Lungo.Router.article("video", "videolist");
      //var processingStatus = response.items[0].processingDetails.processingStatus;
      //var uploadStatus = response.items[0].status.uploadStatus;

      //$('#post-upload-status').append('<li>Processing status: ' + processingStatus + ', upload status: ' + uploadStatus + '</li>');

      // if (processingStatus == 'processing') {
      //   setTimeout(function() {
      //     checkVideoStatus(videoId, waitForNextPoll * 2);
      //   }, waitForNextPoll);
      // } else {
      //   if (uploadStatus == 'processed') {
      //     $('#player').append(response.items[0].player.embedHtml);
      //   }

      //   $('#post-upload-status').append('<li>Final status.</li>');
      //}
    });
  }


	});
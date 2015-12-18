var recordedActions=[];
        var record = false;
        var screenshotIndex = 0;
        var runScreenshotIndex = 0;
        var initTime;

      // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        var connection = new WebSocket('ws://127.0.0.1:1337');

        connection.onopen = function () {
            // connection is opened and ready to use
            connection.send(JSON.stringify({"type":"dimensions"}));
        };

        connection.onerror = function (error) {
            // an error occurred when sending/receiving data
        };

        connection.onmessage = function (message) {
            // try to decode json (I assume that each message from server is json)
            try {
                console.log(message.data);
                if(message.data === 'done') {
                  //setTimeout(displayImage,10000);
                  setTimeout(displayImage,0);
                } else {
                   var json = JSON.parse(message.data);
                  $("#screenshot").width(parseInt(json.width)/3);
                  $("#screenshot").height(parseInt(json.height)/3);
                }
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }
            // handle incoming message
        };

       function fetchBlob(uri, callback) {
         var xhr = new XMLHttpRequest();
         xhr.open('GET', uri, true);
         xhr.responseType = 'arraybuffer';

         xhr.onload = function(e) {
           if (this.status == 200) {
             var blob = this.response;
             if (callback) {
               callback(blob);
             }
           }
         };
         xhr.send();
       };

       function _arrayBufferToBase64(buffer) {
           var binary = '';
           var bytes = new Uint8Array(buffer);
           var len = bytes.byteLength;
           for (var i = 0; i < len; i++) {
               binary += String.fromCharCode(bytes[i]);
           }
           return window.btoa(binary);
       };

       var getScreenshot = function() {
          fetchBlob('screenshots/screen.jpeg', function(blob) {
             var temp = _arrayBufferToBase64(blob);
             $("#screenshot").attr("src",'data:image/jpeg;base64,'+ temp);
          });
          setTimeout(getScreenshot, 0);
       };

       getScreenshot();

        var logActions = function () {
          console.log(recordedActions);
        };

        var getTimeGap = function () {
          var prevTime = initTime;
          initTime = Date.now();
          return initTime - prevTime;
        }

        var startRecording = function () {
          console.log("Started recording");
          record = true;
          var strToSend = JSON.stringify({"type":"clear"});
          connection.send(strToSend);
          initTime = Date.now();
        };

        var stopRecording = function () {
          console.log("Stopped recording");
          record = false;
          window.toggleSlide();
          $('#replay').css({"visibility": 'visible'});
        };

        var captureState = function () {
          console.log("Capturing state");
          var strToSend = JSON.stringify({"type":"capture", "filename":"test"});
          if(record) {
            recordedActions.push(getTimeGap());
            recordedActions.push(JSON.stringify({"type":"capture-run", "filename":"run"}));
          }
          connection.send(strToSend);
        };

        var displayImage = function () {
          // $("#captured-image").append('<img src="screenshots/test/' + screenshotIndex + '.jpeg" class="capture-image"></img>');
          var orig = $("#test");
          var otherDiv =  $("#captured-image");

          otherDiv.append(orig.html().replace('style="width: 360px; height: 640px;', ""));
          screenshotIndex += 1;
        }

        var revealSidebar = function () {
          $(".sidebar2").show("slide", { direction: "right" }, 1200);
        };

        var intervalRef;
        var replayActions = function () {
          record = false;
          // if(recordedActions[0] == JSON.stringify({"type":"capture-run", "filename":"run"})) {
          //   console.log("RUN CAPTURE");
          //   intervalRef = setTimeout(play, 2000);
          // } else {
          //   intervalRef = setTimeout(play, 1000);
          // }
          intervalRef = setTimeout(play, recordedActions.shift());
        };

        var play = function () {
          var strToSend = recordedActions.shift();
          console.log("Replaying next action " + JSON.parse(strToSend).type);
          connection.send(strToSend);
          if(recordedActions.length === 0) {
            console.log("Replay done.");
            $('#results').css({"visibility": "visible"});
          } else {
            if(strToSend == JSON.stringify({"type":"capture-run", "filename":"run"})) {
              console.log("Capture State");
              setTimeout(replayActions, 500);
            } else {
              replayActions();
            }
          }
        };

        var openResultsTab = function () {
          window.open('/bora#?i=' + screenshotIndex);
          screenshotIndex = 0;
        };

       $(function() {

        var $slider = document.getElementById('slider');
        var $toggle = document.getElementById('toggle');
        window.toggleSlide = function () {
          console.log("clicked");
            var isOpen = $slider.classList.contains('slide-in');

            $slider.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
        }
        $toggle.addEventListener('click', toggleSlide);

          $("#screenshot").swipe( {
             tap:function(e, target) {
                var strToSend = JSON.stringify({ "x": e.offsetX*3, "y": e.offsetY*3, "type":"click"});
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
             },
             swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
              console.log(parseInt(fingerData[0].start.x*3 - $("#screenshot").position().left));
              console.log(parseInt(fingerData[0].start.y*3 - $("#screenshot").position().top));
              console.log(event.offsetX*3 + " " + event.offsetY*3);
                var jsonString = {
                   "startX": parseInt(fingerData[0].start.x - $("#screenshot").position().left)*3,
                   "startY": parseInt(fingerData[0].start.y - $("#screenshot").position().top)*3,
                   "endX": event.offsetX*3,
                   "endY": event.offsetY*3,
                   "duration": duration,
                   "type":"swipe"
                };
                var strToSend = JSON.stringify(jsonString);
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
             },

             //Default is 75px, set to 0 for demo so any distance triggers swipe
             threshold:75
          });

          $(document).bind("keypress", function(event) {
            if ( event.which == 13 ) {
                event.preventDefault();
                var strToSend = JSON.stringify({ "key": 66, "type":"key"});
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
            } else if (event.which == 32) {
                if( event.target.disabled || event.target.readOnly ){
                    event.preventDefault();
                }
                var strToSend = JSON.stringify({ "key": "%s", "type":"key"});
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
            } else {
                var strToSend = JSON.stringify({ "key": String.fromCharCode(event.keyCode), "type":"key"});
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
            }
          });

          $(document).bind("keydown keypress", function(event) {
             if (event.which == 8) {
                event.preventDefault();
                var strToSend = JSON.stringify({ "key": 67, "type":"key"});
                if(record) {
                  recordedActions.push(getTimeGap());
                  recordedActions.push(strToSend);
                }
                connection.send(strToSend);
             }
          });
       })

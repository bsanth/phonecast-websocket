var WebSocketServer = require('websocket').server;
var http = require('http');
var exec = require('child_process').exec;

var width = 0;
var height = 0;

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data);
            if(json.type == "key") {
                if(json.key == 67 || json.key == 66 ) {
                    console.log('adb shell input keyevent ' + json.key);
                    exec('adb shell input keyevent ' + json.key, function(error, stdout, stderr) {
                        console.log(error);
                    });
                } else {
                    console.log('adb shell input text ' + json.key);
                    exec('adb shell input text ' + json.key, function(error, stdout, stderr) {
                        console.log(error);
                    });
                }
            } else if (json.type == "click") {
                console.log('adb shell input tap ' + json.x + ' ' + json.y);
                exec('adb shell input tap ' + json.x + ' ' + json.y, function(error, stdout, stderr) {
                   console.log(error);
                });
            } else if (json.type == "swipe") {
                console.log('adb shell input swipe ' + json.startX + ' ' + json.startY + ' ' + json.endX + ' ' + json.endY + ' ' + json.duration);
                exec('adb shell input swipe ' + json.startX + ' ' + json.startY + ' ' + json.endX + ' ' + json.endY + ' ' + json.duration, function(error, stdout, stderr) {
                   console.log(error);
                });
            } else if (json.type == "dimensions") {
                exec('adb shell wm size', function(error, stdout, stderr) {
                  var wxh = stdout.split(':')[1].trim();
                  width = wxh.split('x')[0];
                  height = wxh.split('x')[1];
                  console.log(width + ' ' + height);
                  connection.send(JSON.stringify({ width: width, height:height }));
               });
            }
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});
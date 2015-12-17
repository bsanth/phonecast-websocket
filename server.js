var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));


// START THE SERVER
// =============================================================================
app.use(express.static(__dirname));
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Magic happens on port ' + port);
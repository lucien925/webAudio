var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var url = path.join(__dirname, '../public/media');

router.get('/', function(req, res, next) {
	fs.readdir(url, function(err, files) {
		for(var i = 0; i < files.length; i++) {
			files[i] = path.basename(files[i].toLowerCase(), '.mp3');
		}

		res.render('index', {
			title: 'HTML5 Music Player',
			files: files,
			listTitile: 'Music Program List'
		});
	});
});

module.exports = router;
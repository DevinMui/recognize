var express = require('express')
var app = express()
var multer = require('multer')
var shell = require('shelljs');

var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'test_uploads/')
	},
	filename: function(req, file, cb){
    cb(null, number() + '.jpg')
	}
})

var upload = multer({storage: storage})

app.use(express.static('uploads'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

function number() {
  return shell.exec("python count.py", { silent:true }).output;
}

app.get('/number', function(req, res){
	res.send(number() + '.jpg')
})

app.get('/', function(req, res){
	res.render('index', {"image": "", "tweets": ""})
})

app.post('/', upload.array('picture', 10), function(req, res){
	var arr = req.files.map(function(a) {return a.path;});
	console.dir(arr)
	res.send(arr)
})

app.listen(2000, function () {
  console.log('running on port 2000');
});
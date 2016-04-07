var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var mongoose = require('mongoose');
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Twitter = require('twitter');
var shell = require('shelljs');

var url = "mongodb://localhost:27017/test"

// multer
var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/uploads/')
	},
	filename: function(req, file, cb){
		crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.jpg')
    });
	}
})

var upload = multer({storage: storage})

// multer feed lbph algorithms

var save_storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/pictures/')
	},
	filename: function(req, file, cb){
    cb(null, number() + '.jpg')
	}
})

var save = multer({storage: save_storage})

// twitter api
var client = new Twitter({
  consumer_key: 'WTyIbMfgzZ8lRrrJQr0Xn6ipI',
  consumer_secret: 'NZQi3ZzlkC3LzK01yoabOKqzZpN6sDDwvLJijwQcyVI3IorbYI',
  access_token_key: '2840635218-unXx6CSGSoks9jC06Ghtedc3LaqqvjunCNFfVuP',
  access_token_secret: 'bXXFwOVlO0mDgkmRrbJqSLD4qMzCCgVtPFU6vZjdYgZuI'
});

// mongo methods
mongoose.connect('mongodb://localhost/test');

var userSchema = new mongoose.Schema({
  name: String,
  fb: String,
  tw: String,
  pictures: Array
});

var find = function(db, file, callback) {
	var cursor = db.collection('users').find({"pictures": file});
	cursor.each(function(err, doc) {
	  assert.equal(err, null);
	  //console.dir(doc + "MOTHERFUCKING NULL SHIT")
	  if(doc != null){
	  	console.dir(doc)
	  	callback(doc)
		}
	});
};

// miscellanious functions

function number() {
  return shell.exec("python py/count.py", { silent:true }).output;
}

// express

var app = express()
//app.use(express.static('uploads'));
app.use(express.static('public'))

// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json

app.use(bodyParser.json())

// set view engine to ejs

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

var conn = mongoose.connection

var User = mongoose.model('User', userSchema)

app.get('/number', function(req, res){
	console.log(number())
	res.send(number())
})

app.get('/new', function(req, res){
	res.render('new')
})

app.get('/add_face', function(req, res){
	res.render('add_face')
})

app.get('/', function(req, res){
	res.render('index', {"image": "", "tweets": ""})
})

app.post('/', upload.single('picture'), function(req, res){
	if(req.file != undefined){
		var arg = "public/uploads/" + req.file.filename

		shell.exec("python py/recognize.py " + arg, function(code, stdout, stderr){
			console.log(stderr)
			if(stderr) {
				console.log(stderr)
				res.send(stderr)
			} else {
				MongoClient.connect(url, function(err, db) {
				  assert.equal(null, err);
				  find(db, stdout, function(doc) {
			  		var docu = doc
			  		//console.log(docu)
			  		var params = {screen_name: docu.tw, count: 5};
			  		// get person's latest 5 tweets
						client.get('statuses/user_timeline', params, function(error, tweets, response){
						  if (!error) {
						    res.render("index", {"image": "uploads/" + req.file.filename, "tweets": tweets })
						  }
						});
			      db.close();
				  });
				});
			}
		})
	} else {
		res.send("No files selected")
	}
})

app.post('/add_picture', save.single('save'), function(req, res){
	// post user id as well?
	var id = mongoose.Types.ObjectId("56f6b6d56e401f4010071db8") // need to change this line or something
	var picture = "pictures/" + req.file.filename
	User.update({ _id: id }, { $push: { "pictures": picture }}, function(err, user) {
	  console.dir(user);
	  console.log(err)
	})
	res.send("uploaded! training...")
})

app.post('/new', save.array('save', 200), function(req, res){
	// post an array of pictures? ~ 200 pictures
	console.log(req.files)
	if(!req.body.name && !req.body.fb && !req.body.tw){
		res.send("Something isn't filled out")
	} else if(req.files > 0){
		var arr = req.files.map(function(a) {return a.path;});

		var user = new User ({
			name: req.body.name,
			fb: req.body.fb,
			tw: req.body.tw,
			pictures: arr
		})
		user.save(function(err, user){
			console.log(err)
			shell.exec('python py/update.py "' + arr + '"', function(code, stdout, stderr){
				if(stderr){
					res.send(stderr)
				} else {
					console.log("finished")
					res.send("Saved pictures")
				}
			})
		})
	} else {
		res.send("No files selected")
	}
})

app.get('/about', function(req, res){
	res.render('about')
})

app.listen(3000, function () {
  console.log('running on port 3000');
});
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
  pictures: [String]
});

var find = function(db, file, callback) {
   var cursor = db.collection('users').find({"pictures": file});
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
      	callback(doc)
      }
   });
};

// miscellanious functions

function number() {
  return shell.exec("python count.py", { silent:true }).output;
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
var file = ""

var User = mongoose.model('User', userSchema)

function number() {
  return shell.exec("ls ./pictures | wc -l", { silent:true }).output;
}

app.get('/number', function(req, res){
	console.log(number())
	res.send(number())
})

app.get('/add', function(req, res){
	res.render('add')
})

app.get('/add_face', function(req, res){
	res.render('add_face')
})

app.post('/match', function(req, res){
	file = req.body.match
	res.send('Hello')
})

app.get('/', function(req, res){
	res.render('index', {"image": "", "tweets": ""})
})

app.post('/', upload.single('picture'), function(req, res){
	var arg = "public/uploads/" + req.file.filename
	var options = {
		args: [arg]
	}

	shell.exec("python py/recognize.py " + arg, function(code, stdout, stderr){
		if(stderr) throw stderr;
		console.log('finished')

		// something about these callbacks dont work
		MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  find(db, stdout, function(doc) {
		  		console.log(doc.name)
		  		console.log(doc.tw)
		  		var params = {screen_name: doc.tw, count: 5};
		  		// get person's latest 5 tweets
					client.get('statuses/user_timeline', params, function(error, tweets, response){
					  if (!error) {
					    console.dir(tweets);
					    res.render("index", {"image": req.file.filename, "tweets": tweets })
					  }
					});

		      db.close();
		  });
		});
	})
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

app.post('/new', save.array('save', 100), function(req, res){
	// post an array of pictures? ~ 100+ pictures
	var user = new User ({
		name: req.body.name,
		fb: req.body.fb,
		tw: req.body.tw,
		pictures: req.files
	})
	user.save(function(err, user){
		var arr = req.files.map(function(a) {return a.path;});
		shell.exec('python update.py "' + arr + '"')
	})
	res.send("Saved pictures")
})

app.get('/about', function(req, res){
	res.render('about')
})

app.listen(3000, function () {
  console.log('running on port 3000');
});
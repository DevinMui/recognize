var PythonShell = require('python-shell')
var options = {
	args: [ "pictures/1.jpg" ]
}
PythonShell.run('eigen.py', options, function (err, results) {
	if (err) throw err;
	console.log('finished');
	console.dir(results)
});
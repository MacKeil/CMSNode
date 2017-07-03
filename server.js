/*
 *CMSNode server.js file
 *Created to handle serving up files, and allowing user
 *to add content to database. Later I will implement a content 
 *display function.
 */

var http = require('http'),
	MongoClient = require('mongodb').MongoClient,
	fs = require('fs'),
	views = require('./views.js'),
	mUrl = "mongodb://localhost:27017/CMSNode",
	formidable = require('formidable'),
	crypto = require('crypto');
//create the server  I always use q and s...because minimalism
var server = http.createServer(function(q,s){
	if(q.method === 'GET'){
		//abstraction ftw
		route(q,s);
	}
	if(q.method === 'POST'){
		//more abstraction
		postRoute(q,s);
	}
}).listen(8080);//run on port 8080 for testing, and because we don't have a production level program yet 
console.log('Server running on 127.0.0.1 port 8080');//let the admin know we are currently running

function createSession(response, key){//aka the only time we use crypto
	//create a hash using sha256
	var hash = crypto.createHash('sha256');
	//use the key provided to hash against
	hash.update(key);
	//put our new hash string into a variable
	var sessId = hash.digest('hex');
	//make it a string
	sessId = sessId.toString();
	//now we make a cookie to hold our session Id
	response.setHeader('Set-Cookie', ['session='+sessId, 'expires='+new Date(new Date().getTime()+86409000)]);
	//let the script know what the session Id was
	return sessId;
}


//a function to run all GET requests
function route(q,s){
	//base case
	if(q.url === "/"){
		//send the index file
		fs.readFile(__dirname + '/view/index.html', function(err, data){
			if(err) console.log(err);//errors will be reported to the admin
			s.writeHead(200, {'Content-Type': 'text/html'});//tell 'em what you got
			s.end(data);//actually send the html
		});
	}
	if(q.url.indexOf('.html') != -1){
		//implemented in case of any need for static html pages
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);//once again we report errors to the admin
			s.writeHead(200, {'Content-Type':'text/html'});//responsible web citizenry
			s.end(data);//send the file
		});
	}
	if(q.url.indexOf('.css') != -1){
		//send the css file/files requested
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);//report errors admin
			s.writeHead(200, {'Content-Type':'text/css'});//give them a heads up
			s.end(data);//send the css
		});
	}
	if(q.url.indexOf('.js') != -1){
		//send out the javascript files requested
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);//error reported to admin
			s.writeHead(200, {'Content-Type':'text/javascript'});//head out for a header
			s.end(data);//send the actual javascript...client side this time
		});
	}
	else{
		//make a variable to hold our username
		var qUsr = q.url.substring(1, q.url.length);
		//connect to the databse
		MongoClient.connect(mUrl, function(err, db){
			if(err) console.log(err);//error report to admin
			var query = {'username': qUsr};//make our query for the databse
			db.collection('users').findOne(query, function(err,item){//query the database
				if(item != null){//if there is a user with that name
					s.writeHead(200, {'Content-Type':'text/html'});//start sending the html for this user
					s.write(views.userContent(item.username));//send the head and start the html
					for(var i = item.posts.length; i < item.posts.length; i--){//create a loop for the users content
                                      if(item.posts[i].picLoc != undefined){//if there is a piclocation
                                       s.write(views.article(item.posts[i].title, item.posts[i].message, item.posts[i].picLoc));//send it with the picture
                                      }
                                      else{//no piclocation
                                       s.write(views.article(item.posts[i].title, item.posts[i].message));//send just the post
                                      }
					}
					s.end(views.footerDash);//end it with the universal footer
				}
			});
		});
	}
}
//function for handling POST requests
//almost all database functions will be run through here.
function postRoute(q,s){
	//a sacrificial lamb for our code
	var data = '';
	if(q.url === "/session"){//session cookie handling 
		q.on('data', function(chunk){//get the data
			data += chunk;
		});
		q.on('end', function(){//when the data is updated
			var sess = toAssoc(data);//create an associative array to hold the data
			MongoClient.connect(mUrl, function(err, db){//check if the cookie holds a valid id
				if(err) s.end(err);//send errors to the admin
				db.collection('users').findOne({'session':sess['session']}, function(err, item){
					if(item != null){//if the session id exists in the database
						createSession(s, item.username);//make sure the user has a fresh cookie
						s.writeHead(200, {'Content-Type':'text/html'});//more web citizenry
						s.write(views.dashboard(item.username));//auto login
						s.write(views.addContent(item.username));//let'em add some content
						s.end(views.footerDash);//universal footer
					}
				});
			});
		});
	}
	if(q.url === '/login'){//handle a login request
		q.on('data', function(chunk){//get the data
			data += chunk;
		});
		q.on('end', function(){
			var sess = null;
			var usr = toAssoc(data);
			MongoClient.connect(mUrl, function(err, db){
				db.collection('users').findOne({'username':usr.uname, 'password':usr.pwd}, function(err, item){
					if(item != null){
						sess = createSession(s, usr.uname);
						s.writeHead(200, {'Content-Type': 'text/html'});
						s.write(views.dashboard(usr.uname));
						s.write(views.addContent(usr.uname));
						s.end(views.footerDash);
					}
				});
				if(sess != null){
					db.collection('users').update({'session':sess}, {'username':usr.uname, 'password':usr.pwd});
				}
			});
		});
	}
	if(q.url === '/signup'){
		q.on('data', function(chunk){
			data += chunk;
		});
		q.on('end', function(){
			var fill = toAssoc(data);
			fill['session'] = createSession(s, fill['usrname']);
			MongoClient.connect(mUrl, function(err, db){
				var insert = {'username':fill['usrname'],
				'password':fill['pwd2'],
				'name':fill['name'], 'email':fill['email'],
				'session':fill['session'],
				'posts': [{'title':fill['usrname']+' joined!', 'message':new Date(), 'picLoc':'pic/newMember.jpg'}]
				};
				db.collection('users').insertOne(insert);
				s.writeHead(200, {'Content-Type':'text/html'});
				s.write(views.dashboard(fill['usrname']));
				s.write(views.addContent(fill['usrname']));
				s.end(views.footerDash);
			});
		});
	}
	if(q.url === '/addContent'){
		//this is where I`ll need to use formidable
		var form = new formidable.IncomingForm();
		form.uploadDir = __dirname + '/pic/';
		form.parse(q, function(err,fields, files){
            if(files.size > 0){
			MongoClient.connect(mUrl, function(err,db){
				db.collection('users').update({'username': fields.username}, {$push: {'posts':{'title':fields.title, 'message':fields.message, 'picLoc':'pic/'+files.name}}});
            });
            }
            else{
                MongoClient.connect(mUrl, function(err,db){
                    db.collection('users').update({'username': fields.username}, {$push: {'posts':{'title':fields.title, 'message':fields.message}}});
                });
            }
		});
	}
	if(q.url === '/users'){//handle the ajax request for users
		var out = ''; //create a string to hold the data
		MongoClient.connect(mUrl, function(err,db){ //connect to the database
				var cursor = db.collection('users').find({},{"usrname" : true});//make a cursor that holds the data
				cursor.count(function(err, num){ //get the number of returned documents
						if(err) console.log(err); //if there is an error report it to the admin
						for(var i = 0; i < num; i++){
							cursor.nextObject(function(err, doc){
									if(err) console.log(err);//if there's an error let the admin know
									if(doc != null){ //redundant check for going past the count
										out += doc.username;
										if(i < num - 1){
											out += ",";
										}
									}
									});
						}
						s.writeHead(200, {'Content-Type' : "text"});//make sure the header lets the browser know what it's sending
						s.end(out); //send the completed datastring
						});				
				});
	}
	if(q.url === '/settings'){
		//TODO come up with some settings for the user
	}
}

function toAssoc(smString){
	var container = smString.split('&');
	var output = [];
	for(var i = 0; i < container.length; i++){
		output[container[i].split('=')[0]] = container[i].split('=')[1];
	}
	return output;
}

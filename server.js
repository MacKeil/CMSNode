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
var server = http.createServer(function(q,s){
	if(q.method === 'GET'){
		route(q,s);
	}
	if(q.method === 'POST'){
		postRoute(q,s);
	}
}).listen(8080);
console.log('Server running on 127.0.0.1 port 8080');

function createSession(response, key){//aka the only time we use crypto
	var hash = crypto.createHash('sha256');
	hash.update(key);
	var sessId = hash.digest('hex');
	sessId = sessId.toString();
	response.setHeader('Set-Cookie', ['session='+sessId, 'expires='+new Date(new Date().getTime()+86409000)]);
	return sessId;
}

//TODO: run a check for url having a username
//if valid username in url -> display all 
//content from that user.
function route(q,s){
	if(q.url === "/"){
		fs.readFile(__dirname + '/view/index.html', function(err, data){
			if(err) console.log(err);
			s.writeHead(200, {'Content-Type': 'text/html'});
			s.end(data);
		});
	}
	if(q.url.indexOf('.html') != -1){
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);
			s.writeHead(200, {'Content-Type':'text/html'});
			s.end(data);
		});
	}
	if(q.url.indexOf('.css') != -1){
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);
			s.writeHead(200, {'Content-Type':'text/css'});
			s.end(data);
		});
	}
	if(q.url.indexOf('.js') != -1){
		fs.readFile(__dirname + '/view/' + q.url, function(err, data){
			if(err) console.log(err);
			s.writeHead(200, {'Content-Type':'text/javascript'});
			s.end(data);
		});
	}
	else{
		var qUsr = q.url.substring(1, q.url.length);
		MongoClient.connect(mUrl, function(err, db){
			if(err) console.log(err);
			var query = {'username': qUsr};
			db.collection('users').findOne(query, function(err,item){
				if(item != null){
					s.writeHead(200, {'Content-Type':'text/html'});
					s.write(views.userContent(item.username));
					for(var i = item.posts.length; i < item.posts.length; i--){
                                      if(item.posts[i].picLoc != undefined){
                                       s.write(views.article(item.posts[i].title, item.posts[i].message, item.posts[i].picLoc));
                                      }
                                      else{
                                       s.write(views.article(item.posts[i].title, item.posts[i].message));
                                      }
					}
					s.end(views.footerDash);
				}
			});
		});
	}
}
//TODO implement form handling, login, signup, and new content.
//all database functions will be run through here.
function postRoute(q,s){
	var data = '';
	if(q.url === "/session"){
		q.on('data', function(chunk){
			data += chunk;
		});
		q.on('end', function(){
			var sess = toAssoc(data);
			MongoClient.connect(mUrl, function(err, db){
				if(err) s.end(err);
				db.collection('users').findOne({'session':sess['session']}, function(err, item){
					if(item != null){
						createSession(s, item.username);
						s.writeHead(200, {'Content-Type':'text/html'});
						s.write(views.dashboard(item.username));
						s.write(views.addContent(item.username));
						s.end(views.footerDash);
					}
				});
			});
		});
	}
	if(q.url === '/login'){
		q.on('data', function(chunk){
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

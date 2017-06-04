var views = {};

module.exports = views;


views.dashboard = function(username){
	var output = "<!Doctype html>\n<html>\n<head>\n<link href='css/dash.css' rel='stylesheet' type='text/css'>\n";
	output += "<title>"+username+"'s Dashboard!</title>\n<meta name='author' content='Zachary MacKeil'>\n";
	output += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n</head>\n<body>\n";
        output += "<div class='nav'><h4 id='usrname'>"+username+"\n</h4>\n<ul id='nav-menu'>\n<li class='nav-item'>";
        output += "<a id='add' href='#'>Add Content</a></li>\n<li class='nav-item'><a id='settings'>Settings</a></li>\n";
        output += "<li class='nav-item'><a id='viewContent'>View Content</a></li></ul>\n</div>\n";
	return output;
};

views.pictures = function(picLoc, count){
	var output = "<img src='"+picLoc+"'id='pic"+count+"'>";
	return output;
};

views.addContent = function(username){
	var output = "<form action='/addContent' method='post' enctype='multipart/form-data' id='form'>\n<input id='title' type='text' name='title' placeholder='Title'>";
	output += "<br>\n<input type='textarea' name='message' placeholder='Type your message here!' id='msg'><br>\n";
	output += "<input type='hidden' id='usr' name='username' value="+username+">\n";
	output += "\n<input type='file' name='newPic' id='file'><br>\n<input type='submit' id='sub' value='Add Content'>\n</form>\n";
	return output;
};

views.footerDash = "<script src='js/dash.js'></script>\n<div class='footer'>\n<span id='author-name'>Author: Zachary MacKeil</span>\n</div>\n";

views.picContain = function(picOutArr){
	//picOutArr must be an array.  Damn Javascript wont let me strong type that.
	var output = "<div class='pic-menu'>\n";
	for(var i = 0; i < picOutArr.length; i++){
		output += views.pictures(picOutArr[i], i);
		output += "\n";
	}
	output += "</div>\n";
	return output;
};

views.userContent = function(username){
	var output = "<!Doctype html><html><head><title>"+username+"'s content</title><meta name='author' content='Zachary MacKeil'>";
	output += "<meta name='viewport' content='width=device-width, initial-scale=1.0><link href='css/style.css' rel='stylesheet'>";
	output += "</head><body><div class='nav-bar'><h4 id='title'>"+username+"<ul class='nav'>";
	output += "<li class='nav-item'><a id='home' href='#'>Home</a></li>";
	output += "<li class='nav-item'><a id='login' href='#'>Login</a></li><li class='nav-item'><a id='signup' href='#'>Signup</a></li>";
	output += "<li class='nav-item' id='about'><a id='about' href='#'>About</a></li></ul></div>";
	return output;
};

views.article = function(title, msg){
	var output = "<div class='article'>";
    if(arguments.length > 2) output +="<img src='"+arguments[2]+"' class='art-img'>";
    output += "<h3>"+title+"</h3><p>"+msg+"</p></div>";
	return output;
};

function roundRobin (clicked, old){
	old.classList.add("hidden");
	clicked.classList.remove("hidden");
}

function sessionCookie(){
	var cooky = document.cookie,
		assoc = keyValue(cooky);
	if('session' in assoc){
		var xhp = new XMLHttpRequest();
		xhp.open('POST', '/session', true);
		xhp.send('session=' + assoc['session']);
	}
}


function keyValue(string){
	var arr = string.split(';');
	var assocArr = [];
	for(var i = 0; i < arr.length; i++){
		assocArr[arr[i].split('=')[0]] = arr[i].split('=')[1];
	}
	return assocArr;
}

function getUsers(){
	var usersD = document.getElementById("div-users");
	var xmlhttp = new XMLHttppRequest();
	xmlhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var part = this.responseText.split(',');
			part.foreach(function(e){
					usersD.innerHTML += "<a href='"+window.location.href+"/"+e+"'>"+e+"</a> <br>"; 
					});
		}
	};
	xmlhttp.open("POST", "/users", true);
	xmlhttp.send();	
}

window.onload = function () {
	var current = document.getElementById('div-home');
	var homeDiv = document.getElementById('div-home');
	var loginDiv = document.getElementById('div-login');
	var signupDiv = document.getElementById('div-signup');
	var aboutDiv = document.getElementById('div-about');
	var usersDiv = document.getElementById('div-users');
	var home = document.getElementById('home');
	var login = document.getElementById('login');
	var signup = document.getElementById('signup');
	var about = document.getElementById('about');
	var users = document.getElementById('users');
	home.addEventListener("click", function(e){
		e.preventDefault();
		roundRobin(homeDiv, current);
		current = homeDiv;
	});
	login.addEventListener("click", function(e){
		e.preventDefault();
		roundRobin(loginDiv, current);
		current = loginDiv;
	});
	signup.addEventListener("click", function(e){
		e.preventDefault();
		roundRobin(signupDiv, current);
		current = signupDiv;
	});
	about.addEventListener("click", function(e){
		e.preventDefault();
		roundRobin(aboutDiv, current);
		current = aboutDiv;
	});
	users.addEventListener("click", function(e){
		e.preventDefault();
		roundRobin(usersDiv, current);
		current = usersDiv;
		getUsers();
			});
	sessionCookie();

};

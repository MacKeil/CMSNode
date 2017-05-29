function roundRobin (clicked, old){
	clicked.classList.add("hidden");
	old.classList.remove('hidden');

}

function sessionCookie(){
	var cooky = document.cookie,
		assoc = keyValue(cooky);
	if('session' in assoc){
		var xhp = new XMLHttpRequest();
		xhp.open('POST', '/session', true);
		xhp.send('session='+assoc['session']);
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


window.onload = function () {
	var current = document.getElementById('div-home');
	var homeDiv = document.getElementById('div-home');
	var loginDiv = document.getElementById('div-login');
	var signupDiv = document.getElementById('div-signup');
	var aboutDiv = document.getElementById('div-about');
	var home = document.getElementById('home');
	var login = document.getElementById('login');
	var signup = document.getElementById('signup');
	var about = document.getElementById('about');
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
	sessionCookie();

};

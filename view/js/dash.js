var form = document.getElementById("form"),
    title = document.getElementById('title'),
    msg = document.getElementById('msg'),
    file = document.getElementById('file'),
    usr = document.getElementById('usr');
    sub = document.getElementById('sub');
    
//attach an event listener to the form
form.onsubmit = function(event){
    event.preventDefault();
    sub.innerHTML = "Sending to Server";
    var formD = new FormData();
    formD.append("title", title.value);
    formD.append("message", msg.value);
    formD.append("username", usr.value);
    formD.append("file", file.file);
    sendS(formD);
}

function sendS(formData){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/addContent', true);
    xhr.onload = function(){
        if(xhr.status == 200){
            sub.innerHTML = "Submit";
            form.reset();
        }
        else{
            alert("Error!");
        }
    };
    xhr.send(formData);
}
if(document.addEventListener){
	document.addEventListener("DOMContentLoaded", function(){
		loaded();
	});
} else if(document.attachEvent){
	document.attachEvent("onreadystatechange", function(){
		loaded();
	});
}

function loaded(){

	setInterval(loop, 350);

}

var x = 0;

var titleText = [ "$ 6ha.net", "$ 6ha.ne", "$ 6ha.n", "$ 6ha.", "$ 6ha", "$ 6h", "$ 6", "$ 6h", "$ 6ha", "$ 6ha.", "$ 6ha.n", "$ 6ha.ne", "$ 6ha.net"];

function loop(){

	document.getElementsByTagName("title")[0].innerHTML = titleText[x++%titleText.length];

}

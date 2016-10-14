var KEY = {
    'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16,
    'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27,
    'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36,
    'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40,
    'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59,
    'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93,
    'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107,
    'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110,
    'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145,
    'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189,
    'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192,
    'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220,
    'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222
};
(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();
var Cow = {};
Cow = {
    SRC : "cow.png",
	BACKGROUND: '#000000',
	FIRSTWORD:"OW!",
	SECONDWORD: "STOP THAT!",
	THIRDWORD: "I'M GETTING MAD!",
	DEFAULTWORD: "MOOOOO!",
	DEAD: 15,
	DEADSRC: "cow-dead.jpg",
	FIST:"fist.png"
};
Cow.Consts = [
	{name: "State", consts: ["WAITING", "PAUSED", "PLAYING", "DYING"]},
	{name: "Word", consts: ["WAITING", "PAUSED", "PLAYING", "DYING"]},
];
Cow.User = function (params) {
    var _crazy = 0,
		_hasWord = false;
	
	function addCrazy(){
		_crazy++;
		_hasWord = true;
	}
	function removeCrazy(){
		if(_crazy>0){
			_crazy--;
			_hasWord = false;
		}
	}
	function reset(){
		_crazy=0;
	}
	function hasWord(){
		return _hasWord;
	}
	function isDead(){
		if( _crazy > Cow.DEAD ){
			return true;
		}
	}
	function getWord(){
		switch(true)
		{
			case(_crazy < 5 ):
				return Cow.FIRSTWORD;
			case(_crazy < 10 ):
				return Cow.SECONDWORD;
			case(_crazy < 15 ):
				return Cow.THIRDWORD;
			default:
				return Cow.DEFAULTWORD;
		}
	}

    return {
		addCrazy:addCrazy,
		removeCrazy:removeCrazy,
		reset:reset,
		hasWord:hasWord,
		getWord:getWord,
		isDead:isDead
    };
};
Cow.Screen = function(){

	var _width       = 491,
        _height      = 600,
		image = new Image(),
		deadImage = new Image(),
		fistImage = new Image();
		
	image.src = Cow.SRC;
	deadImage.src = Cow.DEADSRC;
	fistImage.src = Cow.FIST;

	function draw(ctx) {
        ctx.fillStyle = Cow.BACKGROUND;
		ctx.fillRect(0, 0, _width, _height);
        ctx.fill();
		ctx.drawImage(image,0,0);
    }
	function drawUser(ctx,user){
		if(user.hasWord()){
			ctx.fillStyle = '#FFFFFF';
			ctx.font="30px Arial";
			ctx.fillText(user.getWord(), 100, 500);
		}
	}
	function drawFist(ctx,mousePos){
		ctx.drawImage(fistImage,mousePos.x-(fistImage.width/2),mousePos.y-(fistImage.height/2));
	}
	function explode(ctx){
		ctx.fillStyle = '#FF0000';
		ctx.fillRect(0, 0, _width, _height);
		ctx.drawImage(deadImage,20,100);
		ctx.fill();
	}
	return {
        draw:draw,
		drawUser:drawUser,
		explode:explode,
		drawFist:drawFist
    };
}
var COW = (function() {

    /* Generate Constants from Heli.Consts arrays */
    (function (glob, consts) {
        for (var x, i = 0; i < consts.length; i += 1) {
            glob[consts[i].name] = {};
            for (x = 0; x < consts[i].consts.length; x += 1) {
                glob[consts[i].name][consts[i].consts[x]] = x;
            }
        }
    })(Cow, Cow.Consts);
	
	var canvas,
		state = Cow.State.WAITING,
		user = null,
		screen = null,
		ctx,
		mousePos,
		interval = null;
	
	function newGame() {
        if (state != Cow.State.PLAYING) {
            user.reset();
            state = Cow.State.PLAYING;
			requestAnimationFrame(mainLoop);
			interval = setInterval(function(){ user.removeCrazy() },2000);
        }
    }
	
	function pauseGame(){
		clearTimeout(timer);
		state = Cow.State.WAITING;
	}
	
	function resumeGame(){
		timer = window.setInterval(mainLoop, 1000/Cow.FPS);
		state = Cow.State.PLAYING;
	}
	
	function mainLoop() {

        if (state === Cow.State.PLAYING) {
            screen.draw(ctx);
			if( user.isDead() ){
				screen.explode(ctx);
				clearInterval(interval);
			}else{
				screen.drawUser(ctx,user);
				screen.drawFist(ctx,mousePos)
				requestAnimationFrame(mainLoop);
			}
        }
    }
	function click(){
		if(state === Cow.State.WAITING){
			newGame();
		}else{
			user.addCrazy();
		}
	}
	
	function init(wrapper){
		canvas = document.getElementById("canvas");
		var image = new Image();
		image.src = Cow.SRC;
		screen = new Cow.Screen();
		ctx = canvas.getContext('2d');
		if(!image.complete){
			ctx.fillStyle = '#FFFFFF';
			ctx.font="30px Arial";
			ctx.fillText("Loading", 120, 200);
			image.onload = function () {
				loaded();   	
			};
		}else{
			loaded();
		}
        user = new Cow.User();
	}
	
	function startScreen() {
        //screen.draw(ctx);
		ctx.fillStyle = Cow.BACKGROUND;
		ctx.fillRect(0, 0, 491, 600);
        ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.font="30px Arial";
		ctx.fillText("Click to start", 120, 200);
    }


    function loaded() {
        canvas.addEventListener("click", click, true);
		canvas.addEventListener('mousemove', function(evt) {
			mousePos = getMousePos(canvas, evt);
		}, false);
        startScreen();
    }
	
	function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }

    return {
        "init" : init
    };
}());
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
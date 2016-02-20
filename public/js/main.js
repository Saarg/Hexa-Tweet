// Init soxket.io ==============================================================
var socket = io.connect('http://192.168.0.4:8080');

// Init rendered ===============================================================
var renderer = PIXI.autoDetectRenderer(1280, 720,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// Create the root of the scene graph ==========================================
var stage = new PIXI.Container();

// Message =====================================================================
var HUD_message = new PIXI.Text('En attente du serveur');
HUD_message.x = renderer.width/2 - HUD_message.width/2;
HUD_message.y = renderer.height - (HUD_message.height+10) ;

stage.addChild(HUD_message);

// Score =======================================================================
var HUD_score = new PIXI.Text('Score:0');
HUD_score.score = 0;
HUD_score.x = 10;
HUD_score.y = renderer.height - (HUD_score.height+10) ;
HUD_score.addScore = function(s) {
    HUD_score.score += s;
    HUD_score.text = 'Score:'+HUD_score.score;
};

stage.addChild(HUD_score);

// HighScore ===================================================================
var HUD_highScore = new PIXI.Text('Machin:0');
HUD_highScore.player = "machin";
HUD_highScore.score = 0;
HUD_highScore.x = (renderer.width-10) - HUD_highScore.width;
HUD_highScore.y = renderer.height - (HUD_highScore.height+10) ;

stage.addChild(HUD_highScore);

// Hexagone ====================================================================
function newHexagon(tweet, fillColor, lineColor) {
    //hexagon
    var graphics = new PIXI.Graphics();

    graphics.lineColor = lineColor || 0x000000;
    graphics.lineWidth = 1;

    graphics.beginFill(fillColor || 0xFFFFFF);

    graphics.moveTo(100,0);
    for(var i = 1 ; i <= 6 ; i++){
        graphics.lineTo(100*Math.cos(i*Math.PI/3), 100*Math.sin(i*Math.PI/3));
    }

    graphics.endFill();

    graphics.interactive = true;
    graphics.buttonMode = true;
    graphics.hitArea = new PIXI.Rectangle(-75, -90, 150, 180);
    graphics.on('mousedown', onClick);

    stage.addChild(graphics);

    // tweet
    var tweet = new PIXI.Text(tweet);

    tweet.scale.x = 0.5;
    tweet.scale.y = 0.5;
    tweet.x -= tweet.width/2;
    tweet.y -= tweet.height/2;

    graphics.addChild(tweet);

    return graphics;
}

var hexa = [];
var running = true;

socket.on('newTweet', function(tweet) {
    if(running){
        if(hexa.length/4 >= 1) {
            loose();
        } else {
            hexa.push(newHexagon(tweet.replace(/(.{13})/g, "$1\n")))
        }
    }
});

// Start animating =============================================================
requestAnimationFrame(animate);
function animate() {
    requestAnimationFrame(animate);

    // mise a jour de la position des tweets
    for(var i = 0 ; i < hexa.length ; i++) {
        var x = 300*(i%4) + 100;
        var y = 90*parseInt(i/4) + 90;
        if(i%8 > 3) {
            x += 150;
        }
        hexa[i].position.x = x;
        hexa[i].position.y = y;
    }

    // render the root container
    renderer.render(stage);
}

// Interactions with user ======================================================
function onClick() {
    HUD_score.addScore(1);

    hexa.splice(hexa.indexOf(this), 1);
};

// Interactions from server ====================================================
socket.on('message', function(message) {
    HUD_message.text = message
    HUD_message.x = renderer.width/2 - HUD_message.width/2;
    HUD_message.y = renderer.height - (HUD_message.height+10);
});
socket.on('highScore', function(highScore) {
    HUD_highScore.player = highScore.player;
    HUD_highScore.score = highScore.score;
    HUD_highScore.text = HUD_highScore.player+":"+HUD_highScore.score;
});
// Interactions to server ======================================================
function loose() {
    running = false;
    var pseudo = prompt('Quel est votre pseudo ?');
    socket.emit("loose", {score: HUD_score.score, pseudo: 'jean'})
}

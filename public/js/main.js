// Init soxket.io ==============================================================
var socket = io.connect('http://localhost:8080');

// Init rendered ===============================================================
var renderer = PIXI.autoDetectRenderer(document.getElementById("gameView").offsetWidth-40, 720,{backgroundColor : 0xF0F0F0, clearBeforeRender: true});
document.getElementById("gameView").appendChild(renderer.view);

// Create the root of the scene graph ==========================================
var stage = new PIXI.Container();
var nbHex = parseInt(renderer.width/300);

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
HUD_score.reset = function() {
    HUD_score.score = 0;
    HUD_score.text = 'Score:'+HUD_score.score;
};

stage.addChild(HUD_score);

// HighScore ===================================================================
var HUD_highScore = new PIXI.Text('Machin:0');
HUD_highScore.player = "machin";
HUD_highScore.score = 0;
HUD_highScore.x = (renderer.width-10) - HUD_highScore.width;
HUD_highScore.y = renderer.height - (HUD_highScore.height+10);

stage.addChild(HUD_highScore);

// Hexagone ====================================================================
function newHexagon(tweet, fillColor, lineColor) {
    //hexagon
    var graphics = new PIXI.Graphics();

    graphics.lineStyle(1, lineColor || 0x000000, 1);

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
    graphics.on('touchstart', onClick);

    stage.addChild(graphics);

    // tweet
    var tweet = new PIXI.Text(tweet);

    tweet.scale.x = 0.5;
    tweet.scale.y = 0.5;
    tweet.x -= tweet.width/2;
    tweet.y -= tweet.height/2;

    graphics.addChild(tweet);
    graphics.tweetIndex = graphics.getChildIndex(tweet);
    graphics.clicks = 0;

    return graphics;
}

var hexa = [];
var destroy = [];
var running = true;

socket.on('newTweet', function(tweet) {
    if(running){
        if(hexa.length/nbHex >= 5) {
            loose();
        } else {
            hexa.push(newHexagon(tweet.replace(/(.{13})/g, "$1\n")));
        }
    }
});

// Start animating =============================================================
requestAnimationFrame(animate);
function animate() {
    requestAnimationFrame(animate);

    // update teewts position
    for(var i = 0 ; i < hexa.length ; i++) {
        var x = 300*(i%nbHex) + 100;
        var y = 90*parseInt(i/nbHex) + 90;
        if(i%(2*nbHex) > nbHex-1) {
            x += 150;
        }
        hexa[i].position.x = x;
        hexa[i].position.y = y;
    }
    for(var i = 0 ; i < destroy.length ; i++) {
        destroy[i].position.y += 5*destroy[i].clicks;
        destroy[i].rotation += 0.1*destroy[i].clicks;
        if(destroy[i].position.y > renderer.width) {
            stage.removeChild(destroy[i]);
            destroy.splice(i, 1);
        }
    }

    // render the root container
    renderer.render(stage);
}

// Interactions with user ======================================================
function onClick() {
    // first click gives no point and click n gives n points
    HUD_score.addScore(this.clicks);
    this.clicks += 1;

    if(hexa.indexOf(this) != -1) {
        // show the tweet in front of the others
        stage.removeChild(this);
        stage.addChild(this);
        destroy.push(this);
        hexa.splice(hexa.indexOf(this), 1);
    }
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
    HUD_highScore.x = (renderer.width-10) - HUD_highScore.width;
    HUD_highScore.y = renderer.height - (HUD_highScore.height+10);
});
// Interactions to server ======================================================
function loose() {
    running = false;
    var pseudo = prompt('Quel est votre pseudo ?');
    socket.emit("loose", {score: HUD_score.score, pseudo: pseudo});
}

function restart() {
    for(var i = 0 ; i < hexa.length ; i++) {
        // destroy all tweets
        stage.removeChild(hexa[i]);
        hexa[i].clicks = 1;
        destroy.push(hexa[i]);
        stage.addChild(hexa[i]);
    }
    hexa.length = 0;
    HUD_score.reset();
    running = true;
}

// Init soxket.io ==============================================================
var socket = io.connect('http://localhost:8080');

// Init rendered ===============================================================
var renderer = PIXI.autoDetectRenderer(1280, 720,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// Create the root of the scene graph ==========================================
var stage = new PIXI.Container();

// Message =====================================================================
var basicText = new PIXI.Text('Basic text in pixi');
basicText.x = renderer.width/2 - basicText.width/2;
basicText.y = renderer.height - (basicText.height+10) ;

stage.addChild(basicText);

socket.on('message', function(message) {
    basicText.text = message
    basicText.x = renderer.width/2 - basicText.width/2;
    basicText.y = renderer.height - (basicText.height+10);
});

// Hexagone ====================================================================
var newHexagon = function(x, y, tweet, fillColor, lineColor) {
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

    graphics.position.x = x;
    graphics.position.y = y;

    stage.addChild(graphics);

    // tweet
    var tweet = new PIXI.Text(tweet);

    tweet.scale.x = 0.5;
    tweet.scale.y = 0.5;
    tweet.x = x-tweet.width/2;
    tweet.y = y-tweet.height/2;

    stage.addChild(tweet);

    return {graphics: graphics, tweet: tweet}
}
var hexa = [];
socket.on('newTweet', function(tweet) {
    if(hexa/8 >= 3) { // si trop de tweets affiché on le signale au serveur
        return;
    }

    var x = 300*(hexa.length%4) + 100;
    var y = 90*parseInt(hexa.length/4) + 90;
    if(hexa.length%8 > 3) {
        x += 150;
    }
    hexa.push(newHexagon(x, y, tweet.replace(/(.{13})/g, "$1\n")))
});

// Start animating =============================================================
animate();

function animate() {

    requestAnimationFrame(animate);

    // render the root container
    renderer.render(stage);
}

// Init soxket.io ==============================================================
var socket = io.connect('http://192.168.0.4:8080');

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

socket.on('newTweet', function(tweet) {
    if(hexa.length/4 >= 5) { // si trop de tweets affiché on le signale au serveur
        return;
    } else {
        hexa.push(newHexagon(tweet.replace(/(.{13})/g, "$1\n")))
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

function onClick() {
    console.log(hexa.indexOf(this));
    hexa.splice(hexa.indexOf(this), 1);
};

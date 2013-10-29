$(window).load(function(){
            game.init();
        });


var game = {
    mode:"intro",

    init:function() {
        loader.init();
        mouse.init();
        // Hide all other layers
        $('.layer').hide();
        // Display menu
        $('#menu').show();

        game.canvas = $('#mainCanvas')[0];
        game.context = game.canvas.getContext('2d');
    },

    load:function(){
        game.backgroundImage = loader.loadImage("images/background.png");

        if(loader.loaded){
            game.startGame();
        } else {
            loader.onload = game.startGame();
        }
    },

    startGame:function(){
        $('.layer').hide();
        $('#mainCanvas').show();
        game.mode = "intro";
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
    },
    maxSpeed:3,
    minOffset:0,
    maxOffset:1500,
    offsetLeft:0,

    panTo:function(newCenter){
        // console.log("panning to " + newCenter);
        if(Math.abs(newCenter - game.offsetLeft - game.canvas.width / 4) > 0) {
            var deltaX = Math.round((newCenter - game.offsetLeft - game.canvas.width / 4) / 2);
            if (deltaX && Math.abs(deltaX) > game.maxSpeed){
                deltaX = game.maxSpeed * Math.abs(deltaX) / (deltaX);
            }
            game.offsetLeft += deltaX;
        } else {
            return true;
        }

        if(game.offsetLeft < game.minOffset){
            game.offsetLeft = game.minOffset;
            return true;
        } else if(game.offsetLeft > game.maxOffset) {
            game.offsetLeft = game.maxOffset;
            return true;
        }
        return false;
    },

    handlePanning:function(){
        if(game.mode == "intro"){
            if(mouse.dragging){
                game.panTo(mouse.x + game.offsetLeft);
            }
        } else {
            game.offsetLeft++;
        }
    },

    drawForeground:function(){
        game.context.fillText('Magic happens here', 100, 100);
    },

    animate:function(){
        // Animate the background
        game.handlePanning();
        // Draw the background
        game.context.drawImage(game.backgroundImage,game.offsetLeft/4,0,500,500,0,0,500,500);
        game.drawForeground();
        // game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);
        // game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
        // game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);
        if (!game.ended){
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    }
}

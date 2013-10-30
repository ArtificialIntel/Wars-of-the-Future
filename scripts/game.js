$(window).load(function(){
            game.init();
        });


var game = {
    mode:"intro",
    // Size of one square in the grid
    squareSize:16,
    backgroundChanged:true,
    refreshBackground:true,
    offsetX:0,
    offsetY:0,
    // Time in ms until animationloop is called
    animationTimeout:100,

    init:function() {
        loader.init();
        mouse.init();
        // Hide all other layers
        $('.layer').hide();
        // Display menu
        $('#menu').show();

        game.foregroundCanvas = document.getElementById('foregroundCanvas');
        game.foregroundContext = game.foregroundCanvas.getContext('2d');

        game.backgroundCanvas = document.getElementById('backgroundCanvas');
        game.backgroundContext = game.backgroundCanvas.getContext('2d');

        game.canvasWidth = game.backgroundCanvas.width;
        game.canvasHeight = game.backgroundCanvas.height;
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
        $('#gameScreen').show();

        game.running = true;
        game.refreshBackground = true;

        game.drawingLoop();
    },

    animationLoop:function(){

    },

    drawingLoop:function(){
		// game.handlePanning();
		
		if (game.refreshBackground){
			game.backgroundContext.drawImage(game.currentMapImage,game.offsetX,game.offsetY,game.canvasWidth,game.canvasHeight, 0,0,game.canvasWidth,game.canvasHeight);
			game.refreshBackground = false;
		}

		// Clear foreground canvas
		game.foregroundCanvas.width = game.foregroundCanvas.width;

		// Start drawing the foreground elements

		mouse.draw()

		// Call the drawing loop for the next frame using request animation frame
		if (game.running){
			requestAnimationFrame(game.drawingLoop);	
		}						
    }
}

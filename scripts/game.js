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
        // Animate each of the elements within the game
        for (var i = game.items.length - 1; i >= 0; i--){
            game.items[i].animate();
        };

        // Sort game items into a sortedItems array based on their x,y coordinates
        game.sortedItems = $.extend([],game.items);
        game.sortedItems.sort(function(a,b){
            return b.y-a.y + ((b.y==a.y)?(a.x-b.x):0);
          });
    },

    drawingLoop:function(){
		// game.handlePanning();
		
		if (game.refreshBackground){
			game.backgroundContext.drawImage(game.currentMapImage,game.offsetX,game.offsetY,game.canvasWidth,game.canvasHeight, 0,0,game.canvasWidth,game.canvasHeight);
			game.refreshBackground = false;
		}

		// Clear foreground canvas
		game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

        // Start drawing the foreground elements
        for (var i = game.sortedItems.length - 1; i >= 0; i--){
            game.sortedItems[i].draw();
        };

		mouse.draw()

		// Call the drawing loop for the next frame using request animation frame
		if (game.running){
			requestAnimationFrame(game.drawingLoop);	
		}						
    },

	resetArrays:function(){
	    game.counter = 0;
	    game.items = [];
	    game.sortedItems = [];
	    game.staticUnits = [];
	    game.dynamicUnits = [];
	    game.movableUnits = [];
	    game.terrain = [];
	    game.triggeredEvents = [];
	    game.selectedItems = [];
	    game.sortedItems = [];
	},

	add:function(itemDetails) {
	    if (!itemDetails.uid){
	        itemDetails.uid = game.counter++;
	    }

	    var item = window[itemDetails.type].add(itemDetails);

	    // Add the item to the items array
	    game.items.push(item);
	    // Add the item to the type specific array
	    game[item.type].push(item);
	    return item;
	},

	remove:function(item){
        // Unselect item if it is selected
        item.selected = false;
        for (var i = game.selectedItems.length - 1; i >= 0; i--){
            if(game.selectedItems[i].uid == item.uid){
                game.selectedItems.splice(i,1);
                break;
            }
        };

        // Remove item from the items array
        for (var i = game.items.length - 1; i >= 0; i--){
            if(game.items[i].uid == item.uid){
                game.items.splice(i,1);
                break;
            }
        };

        // Remove items from the type specific array
        for (var i = game[item.type].length - 1; i >= 0; i--){
            if(game[item.type][i].uid == item.uid){
                game[item.type].splice(i,1);
                break;
            }
        };
	},
}

var singleplayer = {
    start:function(){
        $('.layer').hide();

        game.type = "singleplayer";
        game.team = "A";

        singleplayer.startCurrentLevel();
    },
    exit:function(){
        $('.layer').hide();
        $('#menu').show();
    },
    currentLevel:0,
	startCurrentLevel:function(){
	    // Load all the items for the level
	    var level = maps.singleplayer[singleplayer.currentLevel];

	    $("#startGame").attr("disabled", true);

	    // Load all the assets for the level
	    game.currentMapImage = loader.loadImage(level.mapImage);
	    game.currentLevel = level;

	    game.offsetX = level.startX * game.gridSize;
	    game.offsetY = level.startY * game.gridSize;

	    // Enable the enter mission button once all assets are loaded
	    if (loader.loaded){
	        $("#startGame").removeAttr("disabled");
	    } else {
	        loader.onload = function(){
	            $("#startGame").removeAttr("disabled");
	        }
	    }

	    $("#setupScreen").show();
	},

    play:function(){
        game.animationLoop();
        game.animationInterval = setInterval(game.animationLoop,game.animationTimeout);
        game.startGame();
    },
};

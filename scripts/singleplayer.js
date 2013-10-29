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
	startCurrentLevel:function(){
	    // Load all the items for the level
	    var level = maps.singleplayer[singleplayer.currentLevel];

	    // Don't allow player to enter mission until all assets for the level are loaded
	    $("#entermission").attr("disabled", true);

	    // Load all the assets for the level
	    game.currentMapImage = loader.loadImage(level.mapImage);
	    game.currentLevel = level;

	    game.offsetX = level.startX * game.gridSize;
	    game.offsetY = level.startY * game.gridSize;

	    // Enable the enter mission button once all assets are loaded
	    if (loader.loaded){
	        $("#entermission").removeAttr("disabled");
	    } else {
	        loader.onload = function(){
	            $("#entermission").removeAttr("disabled");
	        }
	    }

	    // Load the mission screen with the current briefing
	    $('#missonbriefing').html(level.briefing.replace('\n','<br><br>'));    
	    $("#missionscreen").show();        
	},
   
    play:function(){
        game.animationLoop();                        
        game.animationInterval = setInterval(game.animationLoop,game.animationTimeout);
        game.start();
    },   
     
};

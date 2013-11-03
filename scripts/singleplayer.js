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

	    game.offsetX = level.startX * game.squareSize;
	    game.offsetY = level.startY * game.squareSize;

	    game.resetArrays();
        // Preload everything we need
	    for (var type in level.requirements){
	           var requirementArray = level.requirements[type];
	           for (var i=0; i < requirementArray.length; i++) {
	               var name = requirementArray[i];
	               if (window[type]){
	                   window[type].load(name);
	               } else {
	                   console.log('Could not load type :',type);
	               }
	           };
	       }

	    for (var i = level.items.length - 1; i >= 0; i--){
	        var itemDetails = level.items[i];
	        game.add(itemDetails);
	    };

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

    sendCommand:function(uid, details){
        // TODO remove this later if not needed
        game.processCommand(uid, details);
    }
};

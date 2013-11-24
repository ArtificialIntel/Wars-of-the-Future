var singleplayer = {
    start:function(){
        $('.layer').hide();

        game.type = "singleplayer";
        game.team = "A";

        singleplayer.showSetupScreen();
    },

    exit:function(){
        $('.layer').hide();
        $('#menu').show();
    },

    currentLevel:0,

    showSetupScreen:function() {
        $('.layer').hide();
        $("#setupScreen").show();

        // Load all the items for the level
        var level = maps.singleplayer[singleplayer.currentLevel];

        $("#startGame").attr("disabled", true);

        // Load all the assets for the level
        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentGridImage = loader.loadImage(level.gridImage);
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
    },

    play:function(){
        game.animationLoop();
        game.animationInterval = setInterval(game.animationLoop,game.animationTimeout);
        game.startGame();
    },

    sendCommand:function(uid, details){
        // TODO remove this later if not needed
        game.processCommand(uid, details);
    },

    selectUnits:function(){
        var form = document.getElementById("selectionForm");
        form.action = "index.html";
        var movableUnits = ["horseman","sniper","troll"];
        var dynamicUnits = ["dragon","hamster","turtle"];
        var staticUnits = ["gym","armory","tower"];

        for (var i = 0; i < form.moveableUnit.length; i++){
          if (form.moveableUnit[i].checked){
             this.movableUnit = movableUnits[i];
             break;
          }
        }
        for (var i = 0; i < form.dynamicUnit.length; i++){
          if (form.dynamicUnit[i].checked){
             this.dynamicUnit = dynamicUnits[i];
             break;
          }
        }
        for (var i = 0; i < form.staticUnit.length; i++){
          if (form.staticUnit[i].checked){
             this.staticUnit = staticUnits[i];
             break;
          }
        }

        game.add({"type":"staticUnits","name":this.staticUnit,"x":15,"y":17,"team":"A"});
        game.add({"type":"dynamicUnits","name":this.dynamicUnit,"x":13,"y":17,"team":"A","direction":"0"});
        game.add({"type":"movableUnits","name":this.movableUnit,"x":12,"y":17,"team":"A","direction":"2","counter":5});

        singleplayer.play();
    }
};

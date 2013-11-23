$(window).load(function() {
            game.init();
    });

var game = {
    state:"intro",
    // Size of one grid square in px
    squareSize:24,
    gridLength:20,
    turn:0,
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

    load:function() {
        game.backgroundImage = loader.loadImage("images/background.png");

        if(loader.loaded) {
            game.startGame();
        } else {
            loader.onload = game.startGame();
        }
    },

    startGame:function() {
        $('.layer').hide();
        $('#gameScreen').show('slow');

        game.running = true;
        game.refreshBackground = true;

        game.drawingLoop();
    },

    // Called every animationTimeout ms
    animationLoop:function() {
        // Process orders for any item that handles it
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].processOrders) {
                game.items[i].processOrders();
            }
        };

        // Animate each of the elements within the game
        for (var i = game.items.length - 1; i >= 0; i--) {
            game.items[i].animate();
        };

        // Sort game items into a sortedItems array based on their x,y coordinates
        game.sortedItems = $.extend([],game.items);
        game.sortedItems.sort(function(a,b){
            return b.y-a.y + ((b.y==a.y)?(a.x-b.x):0);
          });

        game.lastAnimationTime = (new Date()).getTime();
    },

    // Called by browser
    drawingLoop:function() {
        if (game.refreshBackground) {
            game.backgroundContext.drawImage(game.currentMapImage, game.offsetX, game.offsetY, game.canvasWidth, game.canvasHeight, 0, 0, game.canvasWidth, game.canvasHeight);
            game.refreshBackground = false;
        }

        // Check the time since the game was animated and calculate a linear interpolation factor (-1 to 0)
        // since drawing will happen more often than animation
        // 0 means draw unit at previous location
        // 1 means draw unit at next location
        // TODO actually use this
        game.lastDrawTime = (new Date()).getTime();
        if (game.lastAnimationTime) {
            game.interpolationFactor = (game.lastDrawTime - game.lastAnimationTime) / game.animationTimeout;
            if (game.interpolationFactor > 1) {
                game.interpolationFactor = 1;
            }
        } else {
            game.interpolationFactor = 0;
        }

        // Clear foreground canvas
        game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

        // Draw the grid if unit is selected
        if (game.state == "unitSelected") {
            game.foregroundContext.drawImage(game.currentGridImage, game.offsetX,game.offsetY, game.canvasWidth, game.canvasHeight, 0, 0, game.canvasWidth, game.canvasHeight);
            if (game.selectedItem.movable) {
                game.selectedItem.drawMovement();
            }
        }

        // Start drawing the foreground elements
        for (var i = 0; i < game.sortedItems.length; i++) {
            game.sortedItems[i].draw();
        };

        for (var i = 0; i < game.attacks.length; i++) {
            game.attacks[i].draw();
        };

        // Call the drawing loop for the next frame using request animation frame
        if (game.running) {
            requestAnimationFrame(game.drawingLoop);
        }
    },

    resetArrays:function() {
        game.counter = 0;
        game.items = [];
        game.sortedItems = [];
        game.staticUnits = [];
        game.dynamicUnits = [];
        game.movableUnits = [];
        game.terrain = [];
        game.triggeredEvents = [];
        game.selectedItem = undefined;
        game.sortedItems = [];
        game.attacks = [];
    },

    add:function(itemDetails) {
        if (!itemDetails.uid) {
            itemDetails.uid = game.counter++;
        }

        var item = window[itemDetails.type].add(itemDetails);

        // Add the item to the items array
        game.items.push(item);
        // Add the item to the type specific array
        game[item.type].push(item);
        return item;
    },

    remove:function(item) {
        item.selected = false;
        if(game.selectedItem.uid == item.uid) {
            game.selectedItem = undefined;
            game.state = "intro";
        }

        // Remove item from the items array
        for (var i = game.items.length - 1; i >= 0; i--) {
            if(game.items[i].uid == item.uid) {
                game.items.splice(i,1);
                break;
            }
        };

        // Remove items from the type specific array
        for (var i = game[item.type].length - 1; i >= 0; i--) {
            if(game[item.type][i].uid == item.uid) {
                game[item.type].splice(i,1);
                break;
            }
        };
    },

    // START SELECTION CODE
    selectionBorderColor:"rgba(255,255,0,0.5)",
    selectionFillColor:"rgba(255,215,0,0.2)",
    healthBarBorderColor:"rgba(0,0,0,0.8)",
    healthBarHealthyFillColor:"rgba(0,255,0,0.5)",
    healthBarDamagedFillColor:"rgba(255,0,0,0.5)",
    cannotMoveColor:"rgba(255,0,0,0.2)",
    canMoveColor:"rgba(0,255,0,0.1)",
    lifeBarHeight:5,

    clearSelection:function() {
        if(!game.selectedItem) return;
        game.selectedItem.selected = false;
        game.selectedItem = undefined;
        game.state = "intro";
    },

    selectItem:function(item) {
        if (item.selectable && !item.selected) {
            item.selected = true;
            game.selectedItem = item;
            game.state = "unitSelected";
        }
    },
    // END SELCTION CODE

    // START COMMANDS
    sendCommand:function(uid, details) {
        switch (game.type){
            case "singleplayer":
                singleplayer.sendCommand(uid, details);
                break;
            case "multiplayer":
                // multiplayer.sendCommand(uids,details);
                break;
        }
    },

    getItemByUid:function(uid) {
        for (var i = game.items.length - 1; i >= 0; i--){
            if(game.items[i].uid == uid){
                return game.items[i];
            }
        };
    },

    speedAdjustmentFactor:1/64,
    turnSpeedAdjustmentFactor:1/8,
    // Receive command from single player or multi player object and send it to units
    processCommand:function(uid, details) {
        // In case the target "to" object is in terms of uid, fetch the target object
        if (details.toUid) {
            details.to = game.getItemByUid(details.toUid);
            if (!details.to || details.to.lifeCode=="dead") {
                return;
            }
        }

        var item = game.getItemByUid(uid);
        //if uid is a valid item, set the order for the item
        if (item) {
            item.orders = $.extend([],details);
            if (item.orders.type == "move") {
                // save position before the move
                item.positionBeforeMove = {x:item.x,y:item.y};
            }
        }
    },

    nextTurn:function() {
        this.turn++;
        document.getElementById('turndisplay').innerHTML = "Turn: " + this.turn;

        for (var i = game.items.length - 1; i >= 0; i--) {
            if(game.items[i].movable) {
                game.items[i].hasMoved = false;
            }
            game.items[i].hasAttacked = false;
        }

        this.clearSelection();
    },
    

    // Displays a message for 'time' in milliseconds
    displayMessage:function(message, time, type) {
        messagePlaceholder = document.getElementById('message');
        if (type == "error") {
            messagePlaceholder.style.color = "red";
        } else {
            messagePlaceholder.style.color = "white";
        }

        messagePlaceholder.innerHTML = message;
        messagePlaceholder.style.display = "block";

        window.setTimeout("document.getElementById('message').style.display='none'", time);
    },

    getItemOnSquare:function(square) {
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].x == square.x && game.items[i].y == square.y) {
                return game.items[i];
            }
        }

        return false;
    }
}

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
    // Buffer multipliers
    movementBuff:1,
    damageBuff:1,
    rangeBuff:1,

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
        if(loader.loaded) {
            game.startGame();
        } else {
            loader.onload = game.startGame();
        }
    },

    startGame:function() {
        $('.layer').hide();
        $('#gameScreen').show('slow');

        var buffIcon = document.getElementById('buff-icon');
        buffIcon.setAttribute("src", game.buffIcon);
        buffIcon.style.display = "inline";
        if (singleplayer.buff == "movement") {
            buffIcon.setAttribute("title","Gym: Your units are extra fit and move faster.");
            game.movementBuff = 1.5;
        } else if (singleplayer.buff == "damage") {
            buffIcon.setAttribute("title","Armory: Your units have kick-ass weapons and do more damage.");
            game.damageBuff = 1.5;
        } else if (singleplayer.buff == "range") {
            buffIcon.setAttribute("title","Tower: The tower increases your units' range. Don't ask. It's magic.");
            game.rangeBuff = 1.5;
        }

        game.running = true;
        game.refreshBackground = true;
        game.turn = 0;

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

            // todo game.selectedItem.drawRange();
        }

        if(game.fire) {
            game.foregroundContext.fillStyle = "rgba(255,0,0,0.3)";

            for(i = 0; i < game.fire.length; i++) {
                x = game.fire[i].x * game.squareSize;
                y = game.fire[i].y * game.squareSize;
                game.foregroundContext.fillRect(x, y, game.squareSize, game.squareSize);
            }
        }

        if(game.state == "selectFriendlyUnit") {
            game.foregroundContext.fillStyle = "rgba(10,10,10,0.5)";
            game.foregroundContext.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
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
        game.respawnBuffer = [];
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
        if(game.selectedItem &&
           game.selectedItem.uid == item.uid)
        {
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

        if(game.selectedItem.type == "dynamicUnits") {
            var icon = document.getElementById('special-icon');
            icon.style.display = "none";
        }

        game.selectedItem.selected = false;
        game.selectedItem = undefined;
        game.state = "intro";
    },

    selectItem:function(item) {
        if (item.selectable && !item.selected) {
            item.selected = true;
            game.selectedItem = item;
            game.state = "unitSelected";

            if(item.type == "dynamicUnits") {
                var icon = document.getElementById('special-icon');
                icon.style.display = "inline";
                icon.setAttribute("src", "images/icons/" + item.specialAttackName + ".png");
                icon.setAttribute("title", item.specialAttackTooltip);
            }
        }
    },

    selectTarget:function() {
        if(game.selectedItem.type == "dynamicUnits") {
            if(game.selectedItem.specialAttackName == "Heal") {
                game.state = "selectFriendlyUnit";
            } else if(game.selectedItem.specialAttackName == "Firebomb") {
                game.state = "selectSquare";
            } else if(game.selectedItem.specialAttackName == "Omnomnomnom") {
                game.state = "selectEnemyUnit";
            }
        }
    },

    targetSelected:function(target) {
        if(!target) {
            return;
        }
        game.sendCommand(game.selectedItem.uid, {type:"special", x:target.x, y:target.y});

        game.state = "unitSelected";
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
        if (item) {
            item.orders = $.extend([],details);
            if (item.orders.type == "move") {
                // save position before the move
                item.positionBeforeMove = {x:item.x,y:item.y};
            }
        }
    },
	
	AIMovableUnit:function() {
		var distances = new Array();
		var MUnit = game.getMovableUnit("B");
		var myStaticUnit = game.getStaticUnit("B");
		var myDynamicUnit = game.getDynamicUnit("B");
		var enemyMovableUnit = game.getMovableUnit("A");
		var enemyStaticUnit = game.getStaticUnit("A");
		var enemyDynamicUnit = game.getDynamicUnit("A");
		
		distances=[Math.abs(MUnit.x-myStaticUnit.x)+Math.abs(MUnit.y-myStaticUnit.y), Math.abs(MUnit.x-myDynamicUnit.x)+Math.abs(MUnit.y-myDynamicUnit.y), Math.abs(MUnit.x-enemyStaticUnit.x)+Math.abs(MUnit.y-enemyStaticUnit.y), Math.abs(MUnit.x-enemyDynamicUnit.x)+Math.abs(MUnit.y-enemyDynamicUnit.y), Math.abs(MUnit.x-enemyMovableUnit.x)+Math.abs(MUnit.y-enemyMovableUnit.y)];
		
		var priority = new Array();
		priority.push([5/distances[0],"defendSU"]); //add modifier
		priority.push([4/distances[1],"defendDU"]); //add modifier
		priority.push([3/distances[2],"attackSU"]); //add modifier
		priority.push([2/distances[3],"attackDU"]); //add modifier
		priority.push([2/distances[4],"attackMU"]); //add modifier
		priority.push([1/distances[1],"repair"]); //add modifier
		priority.sort(function(a,b)
					{
						return b[0]-a[0];
					});
		
		var currentTask = priority.pop()[1];
		var target = {x:MUnit.x, y:MUnit.y};
		while (true)
		{
			if (currentTask == "defendSU")
			{
				if (myStaticUnit.underAttack)
				{
					target = {x:myStaticUnit.x+1, y:myStaticUnit.y+1};
					break;
				}
				else
				{
					currentTask = priority.pop()[1];
					continue;
				}
			}
			if (currentTask == "defendDU")
			{
				if (myDynamicUnit.name=="hamster" && myDynamicUnit.state == "inactive" && myDynamicUnit.underAttack)
				{
					target = {x:myDynamicUnit.x+1, y:myDynamicUnit.y-1};
					break;
				}
				else
				{
					currentTask = priority.pop()[1];
					continue;
				}
			}
			if (currentTask == "repair")
			{
				if (myDynamicUnit.name=="turtle" && MUnit.life != MUnit.hitPoints)
				{
					target = {x:myDynamicUnit.x+1, y:myDynamicUnit.y+1};
					break;
				}
				else
				{
					currentTask = priority.pop()[1];
					continue;
				}
			}
			if (currentTask == "attackSU")
			{
				target = {x:enemyStaticUnit.x-1, y:enemyStaticUnit.y-1};
				break;
			}
			if (currentTask == "attackDU")
			{
				target = {x:enemyDynamicUnit.x-1, y:enemyDynamicUnit.y-1};
				break;
			}
			if (currentTask == "attackMU")
			{
				target = {x:enemyMovableUnit.x-1, y:enemyMovableUnit.y-1};
				break;
			}
		}
		
		if (!isSquareInMovementRange(MUnit,target.x,target.y))
		{
			var theta = Math.atan((target.y-MUnit.y)/(target.x-MUnit.x));
			var r = MUnit.speed * game.movementBuff;
			target.x = Math.floor(MUnit.x+r*Math.cos(theta));
			target.y = Math.floor(MUnit.y+r*Math.sin(theta));
		}
		game.sendCommand(MUnit.uid, {type:"move", to:{x:target.x, y:target.y}});
		console.log(MUnit.x,MUnit.y,target.x,target.y,MUnit.lifecode);
		
		var enemies=new Array();
		for (var x=MUnit.x-3; x<=MUnit.x+3; x++)
			for (var y=MUnit.y-3; y<=MUnit.y+3; y++)
			{
				var square={"x":x,"y":y};
				var item = game.getItemOnSquare(square);
				if (item!=false && item.team=="A")
					enemies.push(item);
			}
		enemies.sort(function(a,b)
		{
			if (game.isInRange(MUnit,a)&&!game.isInRange(MUnit,b))
				return -1;
			if (!game.isInRange(MUnit,a)&&game.isInRange(MUnit,b))
				return 1;
			return a.life-b.life;
		});
		if (typeof enemies != 'undefined' && enemies.length > 0)
		{
 			console.log("enemy near movable unit");
			var currentEnemy = enemies.pop();
			game.sendCommand(MUnit.uid, {type:"attack", to:currentEnemy});
			console.log(currentEnemy.type, currentEnemy.x,currentEnemy.y);
			currentEnemy.underAttack = true;
		}
	},
	
	AIStaticUnit:function() {
		var SUnit = game.getStaticUnit("B");
		var enemies=new Array();
		for (var x=SUnit.x-3; x<=SUnit.x+3; x++)
			for (var y=SUnit.y-3; y<=SUnit.y+3; y++)
			{
				var square={"x":x,"y":y};
				var item = game.getItemOnSquare(square);
				if (item!=false && item.team!=SUnit.team)
					enemies.push(item);
			}
		enemies.sort(function(a,b)
		{
			if (game.isInRange(SUnit,a)&&!game.isInRange(SUnit,b))
				return -1;
			if (!game.isInRange(SUnit,a)&&game.isInRange(SUnit,b))
				return 1;
			return a.life-b.life;
		});
		if (typeof enemies != 'undefined' && enemies.length > 0)
		{
 			console.log("enemy near static unit");
			var currentEnemy = enemies.pop();
			game.sendCommand(SUnit.uid, {type:"attack", to:currentEnemy});
			currentEnemy.underAttack = true;
		}
	},

    nextTurn:function() {
        this.clearSelection();
        var turnButton = document.getElementById('end-turn');
        turnButton.style.display = "none";
        game.checkForWinner();

        //dynamic unit player
    	game.dUnitAi("A","A");
		game.AIStaticUnit();
		game.AIMovableUnit();
        this.turn++;
        document.getElementById('turndisplay').innerHTML = "Turn: " + this.turn;
		
		
        for (var i = game.items.length - 1; i >= 0; i--) {
            if(game.items[i].movable) {
                game.items[i].hasMoved = false;
            }

            game.items[i].hasAttacked = false;

            if(game.items[i].restCounter) {
                game.items[i].restCounter--;
            }

            if(game.fire) {
                for(var j = 0; j < game.fire.length; j++) {
                    if(game.items[i].x == game.fire[j].x &&
                       game.items[i].y == game.fire[j].y)
                    {
                        game.items[i].life -= 30;
                    }

                };
            }
        }

        for(i = 0; i < game.respawnBuffer.length; i++) {
            var item = game.respawnBuffer[i];
            item.turns--;

            if(item.turns == -1) {
                // Unit has been respawned -> remove it
                game.respawnBuffer.splice(i,1);
                i--;
                continue;
            }

            if(item.turns == 0) {
                var staticUnit = game.getStaticUnit(item.unit.team);
                if(!staticUnit){
                    continue;
                }
                item.unit.x = Math.abs(2 - staticUnit.x);
                item.unit.y = staticUnit.y;
                item.unit.lifeCode = "alive";
                item.unit.life = item.unit.hitPoints;
                item.unit.drawingX = undefined;
                item.unit.drawingY = undefined;
                item.unit.orders = {type:"stand"};
                game.add(item.unit);
                item.unit.draw();
            }
        }


        turnButton.style.display = "inline";
    },

    checkForWinner:function() {
        var teamACount = 0;
        var teamBCount = 0;

        for(i = 0; i < game.items.length; i++) {
            if(game.items[i].type == "terrain") {
                continue;
            }

            if(game.items[i].team == "A") {
                teamACount++;
            } else if(game.items[i].team == "B") {
                teamBCount++;
            }
        }

        if(teamACount == 0 || teamBCount == 0) {
            game.endGame(teamACount > teamBCount);
        }
    },

    endGame:function(hasPlayerOne) {
        var messageHolder = document.getElementById('gameOverMessage');
        if(hasPlayerOne) {
            messageHolder.innerHTML = 'Congrats, you won!';
        } else {
            messageHolder.innerHTML = 'You lost, try again.';
        }

        $('.layer').hide();
        $('#endscreen').show();
    },

    isNearEnemy:function(teamA,teamB){
    	var unit = game.getMovableUnit(teamA);
	    var eUnit = game.getAliveUnit(teamA,teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    eUnit = game.getMovableUnit(teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    eUnit = game.getStaticUnit(teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    return false;
	
    },
    isNearEnemyD:function(teamA,teamB){
    	var unit = game.getDynamicUnit(teamA);
	    var eUnit = game.getAliveUnit(teamA,teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    eUnit = game.getMovableUnit(teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    eUnit = game.getStaticUnit(teamB);
	    if(game.isInRange(unit, eUnit)){
	        game.sendCommand(unit.uid, {type:"attack", to:eUnit});
		    return true;
	    }
	    return false;
	
    },
    isInRange:function(unit,eUnit){
	    if(eUnit && unit &&
           eUnit.x >= unit.x - unit.range &&
           eUnit.x <= unit.x + unit.range)
        {
		    if(eUnit.y>=unit.y-unit.range&&eUnit.y<=unit.y+unit.range) {
		    	return true;
		    }
	    }
	
        return false;
    },

    dUnitAi:function(teamA,teamB){

    	if(game.isNearEnemy("A","B")==true){
    	}else{
	    	game.moveMUnitAi("A","A");
	    }

    	if(game.isNearEnemyD("B","A")==true){
    	}else{
	    	game.moveDUnitAi("B","A");
	    }

    },
	getAliveUnit:function(teamA,teamB){
		var unit;
		if (teamA==teamB){
			teamB="B";
			unit = game.getStaticUnit(teamB);
		}
		else if(teamA!=teamB){
			unit= game.getDynamicUnit(teamB);
			if (unit.lifeCode == "dead"){
				unit = game.getStaticUnit(teamB);
				if (unit.lifeCode=="dead"){
					unit=game.getMoveableUnit(teamB);
				}
			}
		}
		return unit;		
	},
    moveMUnitAi:function(teamA,teamB){
    	var unit = game.getMovableUnit(teamA);
	    var mUnit = game.getAliveUnit(teamA,teamB);
	    var moveX =0;
	    var moveY = 0;
	    //if mUnit is on the same axisrelative to dUnit
		if (unit.lifeCode =="dead")
			return;
		if(mUnit.x==unit.x || mUnit.y==unit.y){
			    if(mUnit.x==unit.x){
				    if (mUnit.y<unit.y){
						moveY = Math.min(unit.speed,unit.y-mUnit.y+1);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x, y:unit.y-moveY}});

				    }
				    else if(mUnit.y>unit.y) {
					    moveY = Math.min(unit.speed,-unit.y+mUnit.y-1);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x, y:unit.y+moveY}});
				    }
				    	
			    }
			    else if(mUnit.y==unit.y){
				    if (mUnit.x<unit.x){
						moveY = Math.min(unit.speed,unit.x-mUnit.x);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y+1}});

				    }
				    else if(mUnit.x>unit.x) {
					    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y+1}});
				    }
				    	
			    }
		}		//if mUnit is in upper left quadrant relative to dUnit
		else if(mUnit.x<unit.x && mUnit.y<unit.y){
			    moveX = Math.min(unit.speed,unit.x-mUnit.x);
			    moveY = Math.min(unit.speed,unit.y-mUnit.y-1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y-moveY}});
		}
		//if mUnit is in upper right quadrant relative to dUnit
		else if(mUnit.x>unit.x && mUnit.y<unit.y){
			    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
			    moveY = Math.min(unit.speed,unit.y-mUnit.y-1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y-moveY}});
		}
		//if mUnit is in lower left quadrant relative to dUnit
		else if(mUnit.x<unit.x && mUnit.y>unit.y){
			    moveX = Math.min(unit.speed,unit.x-mUnit.x);
			    moveY = Math.min(unit.speed,-unit.y+mUnit.y+1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y+moveY}});
		}
		//if mUnit is in lower right quadrant relative to dUnit
		else if(mUnit.x>unit.x && mUnit.y>unit.y){
			    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
			    moveY = Math.min(unit.speed,-unit.y+mUnit.y+1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y+moveY}});
		}
	},
	moveDUnitAi:function(teamA,teamB){
    	var unit = game.getDynamicUnit(teamA);
	    var mUnit = game.getAliveUnit(teamA,teamB);
	    var moveX =0;
	    var moveY = 0;
	    //if mUnit is on the same axisrelative to dUnit
		console.log(unit.lifeCode);
		if (unit.lifeCode =="dead")
			return;
		if(mUnit.x==unit.x || mUnit.y==unit.y){
			    if(mUnit.x==unit.x){
				    if (mUnit.y<unit.y){
						moveY = Math.min(unit.speed,unit.y-mUnit.y+1);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x, y:unit.y-moveY}});

				    }
				    else if(mUnit.y>unit.y) {
					    moveY = Math.min(unit.speed,-unit.y+mUnit.y-1);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x, y:unit.y+moveY}});
				    }
				    	
			    }
			    else if(mUnit.y==unit.y){
				    if (mUnit.x<unit.x){
						moveY = Math.min(unit.speed,unit.x-mUnit.x);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y+1}});

				    }
				    else if(mUnit.x>unit.x) {
					    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
						game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y+1}});
				    }
				    	
			    }
		}		//if mUnit is in upper left quadrant relative to dUnit
		else if(mUnit.x<unit.x && mUnit.y<unit.y){
			    moveX = Math.min(unit.speed,unit.x-mUnit.x);
			    moveY = Math.min(unit.speed,unit.y-mUnit.y-1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y-moveY}});
		}
		//if mUnit is in upper right quadrant relative to dUnit
		else if(mUnit.x>unit.x && mUnit.y<unit.y){
			    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
			    moveY = Math.min(unit.speed,unit.y-mUnit.y-1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y-moveY}});
		}
		//if mUnit is in lower left quadrant relative to dUnit
		else if(mUnit.x<unit.x && mUnit.y>unit.y){
			    moveX = Math.min(unit.speed,unit.x-mUnit.x);
			    moveY = Math.min(unit.speed,-unit.y+mUnit.y+1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x-moveX, y:unit.y+moveY}});
		}
		//if mUnit is in lower right quadrant relative to dUnit
		else if(mUnit.x>unit.x && mUnit.y>unit.y){
			    moveX = Math.min(unit.speed,-unit.x+mUnit.x);
			    moveY = Math.min(unit.speed,-unit.y+mUnit.y+1);
			    game.sendCommand(unit.uid, {type:"move", to:{x:unit.x+moveX, y:unit.y+moveY}});
		}
	},
	
    getDynamicUnit:function(label){
	    for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
		    if (item.type=="dynamicUnits") {
	                if(item.team==label)
	                {
	                    return item;
	                }
	            }
	    }
	    item.lifeCode="dead";
	    return item;
    },

    getMovableUnit: function(label){
	    for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
		    if (item.type=="movableUnits") {
                if(item.team==label)
                {
                    return item;
                }
            }
	    }
	    item.lifeCode="dead";
	    return item;
    },

    getStaticUnit: function(label){
	    for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
		    if (item.type=="staticUnits") {
                if(item.team==label)
                {
                    return item;
                }
            }
	    }
	    item.lifeCode="dead";
	    return item;
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

var dynamicUnits = {
    units:{
        "dragon":{
            name:"dragon",
            pixelWidth:31,
            pixelHeight:30,
            // offset from actual position
            // towards top left
            pixelOffsetX:3,
            pixelOffsetY:3,
            radius:15,
            attack:"shoot",
            range:3,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            speed:5,
            hitPoints:100,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
            specialAttackName:"Firebomb",
            specialAttackTooltip:"Set an area on fire, damaging enemy units inside",
            specialAttack:function(x, y) {
                console.log("fire");
            },
            restCounter:-1
        },
        "hamster":{
            name:"hamster",
            pixelWidth:31,
            pixelHeight:30,
            // offset from actual position
            // towards top left
            pixelOffsetX:3,
            pixelOffsetY:3,
            radius:15,
            attack:"lance",
            range:5,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            speed:5,
            hitPoints:100,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
            specialAttackName:"Omnomnomnom",
            specialAttackTooltip:"Eat a movable enemy unit, killing it instantly",
            specialAttack:function(x, y) {
                var unit = game.getItemOnSquare({x:x, y:y});

                if(unit) {
                    if(unit.type == "movableUnits") {
                        game.respawnBuffer.push({unit:unit, turns:5});
                    }
                    game.remove(unit);
                    unit.lifeCode = "dead";

                    this.restCounter = 5;
                }
            },
            restCounter:-1
        },
        "turtle":{
            name:"turtle",
            pixelWidth:21,
            pixelHeight:20,
            // offset from actual position
            // towards top left
            pixelOffsetX:-2,
            pixelOffsetY:-2,
            radius:10,
            attack:"shoot",
            range:5,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            speed:3,
            hitPoints:100,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
            specialAttackName:"Heal",
            specialAttackTooltip:"Heal a friendly unit or youself",
            specialAttack:function(x , y) {
                var unit = game.getItemOnSquare({x:x, y:y});

                if(unit && unit.life > 0) {
                    unit.life += 30;
                    if(unit.life > unit.hitPoints) {
                        unit.life = unit.hitPoints;
                    }

                    this.restCounter = 5;
                }
            },
            restCounter:-1
        },
    },
    defaults:{
        type:"dynamicUnits",
        movable:true,
        hasMoved:false,
        hasAttacked:false,
		underAttack:false,
		state:"active",
        animationIndex:0,
        direction:0,
        action:"stand",
        orders:{type:"stand"},
        selected:false,
        selectable:true,
        directions:8,

        animate:function() {
            if (this.life > 20) {
                this.lifeCode = "healthy";
            } else if (this.life > 0) {
                this.lifeCode = "alive";
            } else {
                game.remove(this);
				this.lifeCode = "dead";
                return;
            }

            switch (this.action) {
                case "stand":
                    var direction = wrapDirection(Math.round(this.direction), this.directions);
                    this.imageList = this.spriteArray["stand-" + direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;

                    if (this.animationIndex>=this.imageList.count) {
                        this.animationIndex = 0;
                    }

                break;
            }
        },

        drawLifeBar:function() {
            var x = this.drawingX;
            var y = this.drawingY - 2 * game.lifeBarHeight;
            game.foregroundContext.fillStyle = (this.lifeCode == "healthy")
                                                          ? game.healthBarHealthyFillColor
                                                          : game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.pixelWidth * this.life / this.hitPoints, game.lifeBarHeight)
            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.pixelWidth, game.lifeBarHeight)
        },

        processOrders:function() {
            switch (this.orders.type) {
                case "move":
                    this.lastMovementX = 0;
                    this.lastMovementY = 0;

                    if (this.hasMoved) {
                        game.displayMessage("Sorry, I've moved already this turn.", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    if (!isSquareInMovementRange(this, this.orders.to.x, this.orders.to.y)) {
                        game.displayMessage("I can not move this far.", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    if (this.orders.to.x == this.positionBeforeMove.x &&
                        this.orders.to.y == this.positionBeforeMove.y)
                    {
                        game.displayMessage("I'm already here!", 2500);
                        this.orders = {type:"stand"};
                        return;
                    }

                    var unit = game.getItemOnSquare(this.orders.to);
                    if (unit && unit.uid != this.uid) {
                        game.displayMessage("That square is occupied.", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    var destinationReached = moveUnitToSquare(this, this.orders.to.x, this.orders.to.y);
                    if (destinationReached) {
                        this.hasMoved = true;
                        this.orders = {type:"stand"};
                    }
                    break;
              case "attack":
                    if (this.orders.to.lifeCode == "dead") {
                        this.orders = {type:"stand"};
                        return;
                    }


                    if (this.hasAttacked) {
                        game.displayMessage("I've already attacked this turn.", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    if (!isSquareInRange(this, this.orders.to.x, this.orders.to.y)) {
                        game.displayMessage("That unit is out of range", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    var newDirection = findFiringAngle(this.orders.to, this, this.directions);
                    var angleRadians = -(Math.round(this.direction) / this.directions) * 2 * Math.PI;
                    var bulletX = this.x - (this.radius * Math.sin(angleRadians) / game.squareSize);
                    var flightHeight = this.isFlying ? this.pixelShadowHeight : 0;
                    var bulletY = this.y - (this.radius * Math.cos(angleRadians) / game.squareSize) - flightHeight / game.squareSize;
                    var bullet = game.add(
                                    {
                                        name:this.attack,
                                        type:"attacks",
                                        x:bulletX,
                                        y:bulletY,
                                        direction:newDirection,
                                        target:this.orders.to
                                    });
                    this.orders = {type:"stand"};
                    this.hasAttacked = true;
                    break;
              case "special":
                    if(this.restCounter > 0) {
                        game.displayMessage("Ability is on cooldown(" + this.restCounter + ")", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }
                    this.specialAttack(this.orders.x, this.orders.y);
                    this.orders = {type:"stand"};
                    break;
            }
        },

        drawSelection:function() {
            var center = getCenterOfUnit(this);
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(center.x, center.y, this.radius,
                                       0, Math.PI * 2, false);
            game.foregroundContext.stroke();
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();
        },

        draw:function(){
            if (this.drawingX == undefined) {
                this.drawingX = this.x * game.squareSize - game.offsetX - this.pixelOffsetX;
            }
            if (this.drawingY == undefined) {
                this.drawingY = this.y * game.squareSize - game.offsetY - this.pixelOffsetY;
            }

            if (this.selected){
                this.drawSelection();
            }

            this.drawLifeBar();
            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset,
                                             this.pixelWidth, this.pixelHeight, this.drawingX, this.drawingY,
                                             this.pixelWidth,this.pixelHeight);
        },

        drawMovement:function() {
            for(x = 0; x < game.gridLength; x++) {
                for(y = 0; y < game.gridLength; y++) {
                    if (this.x == x && this.y == y) {
                        continue;
                    }

                    if (isSquareInMovementRange(this, x, y)) {
                        game.foregroundContext.fillStyle = game.canMoveColor;
                        game.foregroundContext.fillRect(x * game.squareSize, y * game.squareSize, game.squareSize, game.squareSize);
                    } else {
                        game.foregroundContext.fillStyle = game.cannotMoveColor;
                        game.foregroundContext.fillRect(x * game.squareSize, y * game.squareSize, game.squareSize, game.squareSize);
                    }
                }
            }
        }
    },

    load:loadItem,
    add:addItem,
}

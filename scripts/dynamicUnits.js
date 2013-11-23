var dynamicUnits = {
    units:{
        "transport":{
            name:"transport",
            pixelWidth:31,
            pixelHeight:30,
            // offset from actual position
            // towards top left
            pixelOffsetX:3,
            pixelOffsetY:3,
            radius:15,
            animationSpeed:15,
            speed:3,
            cost:400,
            hitPoints:100,
            turnSpeed:2,
            spriteImages:[
                {name:"stand",count:1,directions:8}
            ],
        }
    },
    defaults:{
        type:"dynamicUnits",
        movable:true,
        hasMoved:false,
        hasAttacked:false,
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

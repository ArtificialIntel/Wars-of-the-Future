var movableUnits = {
    units:{
        "sniper":{
            name:"sniper",
            pixelWidth:40,
            pixelHeight:40,
            // offset from actual position
            // towards top left
            pixelOffsetX:8,
            pixelOffsetY:50,
            radius:18,
            hitPoints:50,
            attack:"shoot",
            range:10,
            speed:3,
            isFlying:true,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
        "horseman":{
            name:"horseman",
            pixelWidth:40,
            pixelHeight:40,
            // offset from actual position
            // towards top left
            pixelOffsetX:8,
            pixelOffsetY:50,
            radius:18,
            hitPoints:50,
            attack:"lance",
            range:5,
            speed:10,
            isFlying:true,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
        "troll":{
            name:"troll",
            pixelWidth:40,
            pixelHeight:40,
            // offset from actual position
            // towards top left
            pixelOffsetX:8,
            pixelOffsetY:50,
            radius:18,
            hitPoints:50,
            attack:"hit",
            range:3,
            speed:5,
            isFlying:true,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            animationSpeed:15,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
    },

    defaults:{
        type:"movableUnits",
        movable:true,
        hasMoved:false,
        hasAttacked:false,
		underAttack:false,
        animationIndex:0,
        direction:0,
        directions:8,
        action:"stand",
        selected:false,
        selectable:false,
        orders:{type:"stand"},

        animate:function(){
            if (this.life > 20) {
                this.lifeCode = "healthy";
            } else if (this.life > 0) {
                this.lifeCode = "alive";
            } else {
                game.remove(this);
                game.respawnBuffer.push({unit:this, turns:5});
				this.lifeCode = "dead";
                return;
            }

            switch (this.action){
                case "stand":
                    var direction = wrapDirection(Math.round(this.direction), this.directions);
                    this.imageList = this.spriteArray["fly-" + direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex >= this.imageList.count){
                         this.animationIndex = 0;
                    }
                break;
            }
        },

        processOrders:function() {
            switch (this.orders.type){
                case "move":
                    this.lastMovementX = 0;
                    this.lastMovementY = 0;

                    if (this.hasMoved) {
                        game.displayMessage("Sorry, I've moved already this turn.", 2500, "error");
                        this.orders = {type:"stand"};
                        return;
                    }

                    if (!isSquareInMovementRange(this, this.orders.to.x, this.orders.to.y)) {
                        game.displayMessage("I can not move this far", 2500, "error");
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

                    var flightHeight = this.isFlying ? this.pixelShadowHeight : 0;
                    var bulletX = this.x - (this.radius * Math.sin(angleRadians) / game.squareSize);
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
            }
        },

        drawLifeBar:function() {
            var x = this.drawingX;
            var y = this.drawingY - 2 * game.lifeBarHeight;
            game.foregroundContext.fillStyle = (this.lifeCode == "healthy") ? game.healthBarHealthyFillColor : game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.pixelWidth * this.life / this.hitPoints, game.lifeBarHeight)
            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.pixelWidth, game.lifeBarHeight)
        },

        drawSelection:function() {
            var center = getCenterOfUnit(this);
            if (this.isFlying) {
                // center of flying units is lower,
                // subtract the offset
                center.y -= this.pixelShadowHeight;
            }
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 2;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(center.x, center.y, this.radius,
                                       0, Math.PI * 2, false);
            game.foregroundContext.stroke();
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();

            game.foregroundContext.beginPath();
            game.foregroundContext.arc(center.x, center.y + this.pixelShadowHeight, 4,
                                       0, Math.PI*2, false);
            game.foregroundContext.stroke();

            game.foregroundContext.beginPath();
            game.foregroundContext.moveTo(center.x,center.y);
            game.foregroundContext.lineTo(center.x, center.y + this.pixelShadowHeight);
            game.foregroundContext.stroke();
        },

        draw:function() {
            if (this.drawingX == undefined) {
                this.drawingX = this.x * game.squareSize - game.offsetX - this.pixelOffsetX;
            }
            if (this.drawingY == undefined) {
                this.drawingY = this.y * game.squareSize - game.offsetY - this.pixelOffsetY;
            }

            if (this.selected) {
                this.drawSelection();
            }

            this.drawLifeBar();
            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            var shadowOffset = this.pixelHeight * 2; // The aircraft shadow is on the second row of the sprite sheet

            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset,
                                             this.pixelWidth, this.pixelHeight, this.drawingX, this.drawingY,
                                             this.pixelWidth, this.pixelHeight);
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, shadowOffset,
                                             this.pixelWidth, this.pixelHeight, this.drawingX, this.drawingY + this.pixelShadowHeight,
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


var staticUnits = {
    units:{
        "gym":{
            name:"gym",
            // Properties for drawing the object
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:10,
            // Properties for describing structure for pathfinding
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            hitPoints:500,
			attack:"hit",
            spriteImages:[
                {name:"healthy",count:4},
				{name:"alive",count:1}
            ],
        },
        "armory":{
            name:"armory",
            // Properties for drawing the object
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:10,
            // Properties for describing structure for pathfinding
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            hitPoints:500,
			attack:"hit",
            spriteImages:[
                {name:"healthy",count:4},
				{name:"alive",count:1}
            ],
        },
        "tower":{
            name:"tower",
            // Properties for drawing the object
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:10,
            // Properties for describing structure for pathfinding
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            hitPoints:500,
			attack:"hit",
            spriteImages:[
                {name:"healthy",count:4},
				{name:"alive",count:1}
            ],
        }
    },
    defaults:{
        type:"staticUnits",
		underAttack:false,
        movable:false,
        hasAttacked:false,
        animationIndex:0,
        direction:0,
        orders:{ type:"stand" },
        action:"stand",
        selected:false,
        selectable:true,
        animate:function(){
            if (this.life > 20) {
                this.lifeCode = "healthy";
            } else if (this.life > 0) {
                this.lifeCode = "alive";
            } else {
				game.remove(this);
                /*this.x=60;
				this.y=60;
				this.lifeCode = "dead";*/
                return;
            }

            switch (this.action){
                // add your action here if you want it animated
                case "stand":
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
            }
        },

        drawLifeBar:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY - 2 * game.lifeBarHeight;

            game.foregroundContext.fillStyle = this.lifeCode == "healthy"
                                               ? game.healthBarHealthyFillColor
                                               :game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.baseWidth * this.life / this.hitPoints, game.lifeBarHeight)

            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.baseWidth, game.lifeBarHeight)
        },
		
		 processOrders:function() {
            switch (this.orders.type) {
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
                    var bulletY = this.y - (this.radius * Math.cos(angleRadians) / game.squareSize) - this.pixelShadowHeight / game.squareSize;
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
		
        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fillRect(x-1,y-1,this.baseWidth+2,this.baseHeight+2);
            game.foregroundContext.strokeRect(x-1,y-1,this.baseWidth+2,this.baseHeight+2);
        },

        draw:function(){
            var x = (this.x * game.squareSize) - game.offsetX - this.pixelOffsetX;
            var y = (this.y * game.squareSize) - game.offsetY - this.pixelOffsetY;

            this.drawingX = x;
            this.drawingY = y;

            if (this.selected){
                this.drawSelection();
            }
            this.drawLifeBar();
            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}

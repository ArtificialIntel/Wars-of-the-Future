var dynamicUnits = {
    units:{
        "transport":{
            name:"transport",
            pixelWidth:31,
            pixelHeight:30,
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:15,
            speed:15,
            sight:3,
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
        animationIndex:0,
        direction:0,
        action:"stand",
        orders:{type:"stand"},
        selected:false,
        selectable:true,
        directions:8,
        animate:function(){
            if (this.life > 0){
                this.lifeCode = "alive";
            } else {
                this.lifeCode = "dead";
                game.remove(this);
                return;
            }

            switch (this.action){
                case "stand":
                    console.log("calling from dynamicUnits.js::animate");
                    var direction = wrapDirection(Math.round(this.direction), this.directions);
                    this.imageList = this.spriteArray["stand-" + direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;

                    if (this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }

                break;
            }
        },

        drawLifeBar:function(){
            var x = this.drawingX;
            var y = this.drawingY - 2 * game.lifeBarHeight;
            game.foregroundContext.fillStyle = (this.lifeCode == "healthy") ? game.healthBarHealthyFillColor : game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.pixelWidth * this.life / this.hitPoints, game.lifeBarHeight)
            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.pixelWidth, game.lifeBarHeight)
        },

        moveTo:function(destination){
            // Find out where we need to turn to get to destination
            var newDirection = findAngle(destination,this,this.directions);
            // Calculate difference between new direction and current direction
            var difference = angleDiff(this.direction,newDirection,this.directions);
            // Calculate amount that aircraft can turn per animation cycle
            var turnAmount = this.turnSpeed*game.turnSpeedAdjustmentFactor;
            if (Math.abs(difference)>turnAmount){
                console.log("calling from dynamicUnits.js::moveTo");
                this.direction = wrapDirection(parseFloat(this.direction)+turnAmount*Math.abs(difference)/difference,this.directions);
            } else {
                var movement = this.speed*game.speedAdjustmentFactor;
                var angleRadians = -(Math.round(this.direction)/this.directions)*2*Math.PI ;
                this.lastMovementX = - (movement*Math.sin(angleRadians));
                this.lastMovementY = - (movement*Math.cos(angleRadians));
                this.x = (this.x +this.lastMovementX);
                this.y = (this.y +this.lastMovementY);
            }
        },

        processOrders:function(){
            this.lastMovementX = 0;
            this.lastMovementY = 0;
            switch (this.orders.type){
                case "move":
                    // Move towards destination and stop when close by
                    if ((Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2)) < Math.pow(this.radius / game.squareSize, 2)) {
                        this.orders = {type:"stand"};
                       } else {
                            this.moveTo(this.orders.to);
                       }
                    break;
            }
        },

        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x, y, this.radius, 0, Math.PI*2, false);
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();
            game.foregroundContext.stroke();
        },

        draw:function(){
            var x = (this.x * game.squareSize) - game.offsetX - this.pixelOffsetX;
            var y = (this.y * game.squareSize) - game.offsetY - this.pixelOffsetY;
            this.drawingX = x;
            this.drawingY = y;
            if (this.selected){
                this.drawSelection();
                this.drawLifeBar();
            }
            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth,colorOffset, this.pixelWidth,this.pixelHeight,x,y,this.pixelWidth,this.pixelHeight);
        }
    },

    load:loadItem,
    add:addItem,
}

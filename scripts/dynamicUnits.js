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
                    var direction = this.direction;
                    this.imageList = this.spriteArray["stand-"+direction];
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
        drawSelection:function(){
            console.log('inside draw selection');
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

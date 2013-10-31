var movableUnits = {
    units:{
        "chopper":{
            name:"chopper",
            cost:900,
            pixelWidth:40,
            pixelHeight:40,
            pixelOffsetX:20,
            pixelOffsetY:20,
            weaponType:"heatseeker",
            radius:18,
            sight:4,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            hitPoints:50,
            speed:25,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
    },
    defaults:{
        type:"movableUnits",
        animationIndex:0,
        direction:0,
        directions:8,
        action:"stand",
        selected:false,
        selectable:true,
        orders:{type:"stand"},
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
                    this.imageList = this.spriteArray["fly-"+ direction];
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
            game.foregroundContext.fillStyle = (this.lifeCode == "alive") ? game.healthBarHealthyFillColor : game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.pixelWidth * this.life / this.hitPoints, game.lifeBarHeight)
            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.pixelWidth, game.lifeBarHeight)
        },
        drawSelection:function(){
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 2;
            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x,y,this.radius,0,Math.PI*2,false);
            game.foregroundContext.stroke();
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fill();

            game.foregroundContext.beginPath();
            game.foregroundContext.arc(x,y + this.pixelShadowHeight, 4, 0, Math.PI*2, false);
            game.foregroundContext.stroke();

            game.foregroundContext.beginPath();
            game.foregroundContext.moveTo(x,y);
            game.foregroundContext.lineTo(x, y + this.pixelShadowHeight);
            game.foregroundContext.stroke();
        },
        draw:function(){
            var x = (this.x * game.squareSize) - game.offsetX - this.pixelOffsetX;
            var y = (this.y * game.squareSize) - game.offsetY - this.pixelOffsetY - this.pixelShadowHeight;
            this.drawingX = x;
            this.drawingY = y;
            if (this.selected){
                this.drawSelection();
                this.drawLifeBar();
            }
            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            var shadowOffset = this.pixelHeight * 2; // The aircraft shadow is on the second row of the sprite sheet

            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth, shadowOffset, this.pixelWidth, this.pixelHeight, x, y+this.pixelShadowHeight, this.pixelWidth,this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}

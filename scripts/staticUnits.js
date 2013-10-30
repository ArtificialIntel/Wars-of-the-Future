var staticUnits = {
    units:{
        "base":{
            name:"base",
            // Properties for drawing the object
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:20,
            // Properties for describing structure for pathfinding
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            sight:3,
            hitPoints:500,
            cost:5000,
            spriteImages:[
                {name:"alive",count:4}
            ],
        }
    },
    defaults:{
        type:"staticUnits",
        animationIndex:0,
        direction:0,
        orders:{ type:"stand" },
        action:"stand",
        selected:false,
        selectable:true,
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
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                    break;
            }
        },

        draw:function(){
            var x = (this.x*game.squareSize) - game.offsetX-this.pixelOffsetX;
            var y = (this.y*game.squareSize) - game.offsetY-this.pixelOffsetY;

            var colorIndex = (this.team == "A") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}

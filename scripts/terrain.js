var terrain = {
    units:{
        "bigrocks":{
            name:"bigrocks",
            pixelWidth:40,
            pixelHeight:70,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:30,
            buildableGrid:[
                [1,1],
                [0,1]
            ],
            passableGrid:[
                [1,1],
                [0,1]
            ],
            spriteImages:[
                {name:"default",count:1},
            ],
        }
    },
    defaults:{
        type:"terrain",
        animationIndex:0,
        action:"default",
        selected:false,
        selectable:false,
        animate:function(){
            switch (this.action){
                case "default":
                    this.imageList = this.spriteArray["default"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex>=this.imageList.count){
                        this.animationIndex = 0;
                    }
                break;
            }
        },
        draw:function(){
            var x = (this.x * game.squareSize) - game.offsetX - this.pixelOffsetX;
            var y = (this.y * game.squareSize) - game.offsetY - this.pixelOffsetY;

            var colorOffset = 0;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset,
                this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}

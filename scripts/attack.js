var attacks = {
    units:{
        "fireball":{
            name:"fireball",
            speed:60,
            range:8,
            damage:10,
            spriteImages:[
                {name:"fly",count:1,directions:8},
                {name:"explode",count:7}
            ],
        }
    },
    defaults:{
        type:"attacks",
        distanceTravelled:0,
        animationIndex:0,
        direction:0,
        directions:8,
        pixelWidth:10,
        pixelHeight:11,
        pixelOffsetX:5,
        pixelOffsetY:5,
        radius:6,
        action:"fly",
        selected:false,
        selectable:false,
        orders:{type:"fire"},
        moveTo:function(destination) {
            var movement = this.speed * game.speedAdjustmentFactor;
            this.distanceTravelled += movement;

            var angleRadians = -((this.direction) / this.directions) * 2 * Math.PI;

            this.lastMovementX = - (movement * Math.sin(angleRadians));
            this.lastMovementY = - (movement * Math.cos(angleRadians));
            this.x = (this.x + this.lastMovementX);
            this.y = (this.y + this.lastMovementY);
        },

        reachedTarget:function() {
            var item = this.target;
            if (item.type == "staticUnits") {
                return (item.x <= this.x && item.x >= this.x - item.baseWidth
                        / game.squareSize && item.y<= this.y && item.y >= this.y - item.baseHeight / game.squareSize);
            } else if (item.isFlying == true) {
                return (Math.pow(item.x - this.x, 2) + Math.pow(item.y - (this.y + item.pixelShadowHeight / game.squareSize), 2)
                       < Math.pow((item.radius) / game.squareSize, 2));
           } else {
                return (Math.pow(item.x - this.x, 2) + Math.pow(item.y - this.y, 2) < Math.pow((item.radius) / game.squareSize, 2));
           }
        },

        processOrders:function() {
            this.lastMovementX = 0;
            this.lastMovementY = 0;
            switch (this.orders.type) {
                case "fire":
                    // Move towards destination and stop when close by or if travelled past range
                    var reachedTarget = this.reachedTarget();
                    if(reachedTarget) {
                        this.target.life -= this.damage;
                        this.orders = {type:"explode"};
                        this.action = "explode";
                        this.animationIndex = 0;
                    } else {
                        this.moveTo(this.target);
                    }
                    break;
            }
        },

        animate:function() {
            switch (this.action) {
                case "fly":
                    var direction = wrapDirection(Math.round(this.direction), this.directions);
                    this.imageList = this.spriteArray["fly-"+ direction];
                    this.imageOffset = this.imageList.offset;
                    break;
                case "explode":
                    this.imageList = this.spriteArray["explode"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex >= this.imageList.count) {
                        game.remove(this);
                    }
                    break;
            }
        },

        draw:function() {
            var x = (this.x * game.squareSize) - game.offsetX - this.pixelOffsetX
                    + this.lastMovementX * game.drawingInterpolationFactor * game.squareSize;
            var y = (this.y * game.squareSize) - game.offsetY - this.pixelOffsetY + this.lastMovementY * game.drawingInterpolationFactor * game.squareSize;
            var colorOffset = 0;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}

function findFiringAngle(target, source, directions) {
    var dy = (target.y) - (source.y);
    var dx = (target.x) - (source.x);

    if (target.isFlying) {
        dy -= target.pixelShadowHeight / game.squareSize;
    } else if (target.baseWidth && target.baseHeight) {
        dy += target.baseWidth / 2 / game.squareSize;
        dx += target.baseHeight / 2 / game.squareSize;
    }

    if (source.isFlying) {
        dy += source.pixelShadowHeight / game.squareSize;
    } else if (target.baseWidth && target.baseHeight) {
        dy -= source.baseWidth / 2 / game.squareSize;
        dx -= source.baseHeight / 2 / game.squareSize;
    }

    //Convert Arctan to value between (0 - 7)
    var angle = wrapDirection(directions / 2 - (Math.atan2(dx, dy) * directions / (2 * Math.PI)), directions);
    return angle;
}

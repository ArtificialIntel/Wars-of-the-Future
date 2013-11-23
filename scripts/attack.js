var attacks = {
    units:{
        "fireball":{
            name:"fireball",
            speed:20,
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
        moveTo:function(target) {
            var centerOfUnit = getCenterOfUnitDrawing(target);
            var dx = centerOfUnit.x / game.squareSize - this.x;
            var dy = centerOfUnit.y / game.squareSize - this.y;
            var movement = this.speed * game.speedAdjustmentFactor;

            this.x = this.x + dx * movement;
            this.y = this.y + dy * movement;
        },

        reachedTarget:function() {
            var centerOfBullet = getCenterOfUnitDrawing(this);
            var centerOfTarget = getCenterOfUnitDrawing(this.target);
            if (Math.abs(centerOfBullet.x - centerOfTarget.x) < game.squareSize / 3 &&
                Math.abs(centerOfBullet.y - centerOfTarget.y) < game.squareSize / 3)
            {
                    return true;
            }

            return false;
        },

        processOrders:function() {
            switch (this.orders.type) {
                case "fire":
                    // Move towards destination and stop when close by or if travelled past range
                    var reachedTarget = this.reachedTarget();
                    if (reachedTarget) {
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
            var x = this.x * game.squareSize - this.pixelOffsetX;
            var y = this.y * game.squareSize - this.pixelOffsetY;
            var colorOffset = 0;
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset * this.pixelWidth,
                                             colorOffset, this.pixelWidth, this.pixelHeight,
                                             x, y, this.pixelWidth, this.pixelHeight);

            this.drawingX = this.x * game.squareSize;
            this.drawingY = this.y * game.squareSize;
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

// Returns the center of given unit's drawing
// in absolute pixels NOT in terms of squareSize
function getCenterOfUnitDrawing(unit) {
    return {
        x:unit.drawingX + unit.pixelWidth / 2,
        y:unit.drawingY + unit.pixelHeight / 2
    };
}

function isSquareInRange(unit, x, y) {
    if (Math.abs(unit.x - x) > unit.range || Math.abs(unit.y - y) > unit.range) {
        return false;
    }

    return true;
}

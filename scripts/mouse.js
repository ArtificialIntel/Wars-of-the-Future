var mouse = {
    // coordinates on canvas
    x:0,
    y:0,
    // coordinates relative to top left of the map
    mapX:0,
    mapY:0,
    // coordinates on grid
    gridX:0,
    gridY:0,
    insideCanvas:false,

    init:function(){
        var mouseCanvas = $('#foregroundCanvas');

        mouseCanvas=document.getElementById('foregroundCanvas');
        mouseCanvas.addEventListener('mousemove', this.mouseMoveHandler, false);
        mouseCanvas.addEventListener('mousedown', this.mouseDownHandler, false);
        // window.addEventListener('keypress',keyPressHandler,false);
    },

    itemUnderMouse:function(){
        for (var i = game.items.length - 1; i >= 0; i--){
            var item = game.items[i];
            if (item.type=="staticUnits"){
                if(item.lifeCode != "dead" &&
                   item.x <= mouse.mapX / game.squareSize &&
                   item.x >= (mouse.mapX - item.baseWidth) / game.squareSize &&
                   item.y <= mouse.mapY / game.squareSize &&
                   item.y >= (mouse.mapY - item.baseHeight) / game.squareSize)
                {
                    return item;
                }
            } else if (item.type == "movableUnits"){
                if (item.lifeCode != "dead" &&
                    Math.pow(item.x - mouse.mapX / game.squareSize, 2) + Math.pow(item.y - (mouse.mapY + item.pixelShadowHeight) / game.squareSize, 2) < Math.pow((item.radius) / game.squareSize, 2)){
                    return item;
                }
           } else {
                if (item.lifeCode != "dead" && Math.pow(item.x - mouse.mapX / game.squareSize, 2) + Math.pow(item.y - mouse.mapY / game.squareSize, 2) < Math.pow((item.radius) / game.squareSize, 2)){
                    return item;
                }
            }
        }
    },

    calculateGameCoordinates:function(){
        mouse.mapX = mouse.x + game.offsetX ;
        mouse.mapY = mouse.y + game.offsetY;

        mouse.gridX = Math.floor(mouse.mapX / game.squareSize);
        mouse.gridY = Math.floor(mouse.mapY / game.squareSize);
    },

    // START HANDLER
    mouseMoveHandler:function(ev){
        mouse.x = ev.clientX;
        mouse.y = ev.clientY;

        mouse.calculateGameCoordinates();
    },

    mouseDownHandler:function(ev){
        if(ev.which == 1){// Left click
            var clickedItem = mouse.itemUnderMouse();

            if (clickedItem){// Player clicked on sth
                if(clickedItem.type != "terrain"){
                    if(clickedItem.team == game.team){
                        // Player clicked on friendly unit
                        game.clearSelection();
                        game.selectItem(clickedItem);
                    } else {
                        // TODO handle attack here
                        // 1. move to square in range
                        // 2. attack unit
                    }
                }
            } else if (game.selectedItem &&
                       game.selectedItem.team == game.team &&
                       game.selectedItem.movable){
                // Player has own unit selected and clicked
                // somewhere on map
                game.sendCommand(game.selectedItem.uid, {type:"move", to:{x:mouse.gridX, y:mouse.gridY}});
            }
        } else if (ev.which == 3){// Right click
            game.clearSelection();
        }

        return false;
    },

    mouseLeaveHandler:function(ev){
        mouse.insideCanvas = false;
    },

    mouseEnterHandler:function(ev){
        mouse.leftDown = false;
        mouse.insideCanvas = true;
    }
}

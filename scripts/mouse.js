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

    init:function() {
        var mouseCanvas = $('#foregroundCanvas');

        mouseCanvas=document.getElementById('foregroundCanvas');
        mouseCanvas.addEventListener('mousemove', this.mouseMoveHandler, false);
        mouseCanvas.addEventListener('mousedown', this.mouseDownHandler, false);
        // window.addEventListener('keypress',keyPressHandler,false);
    },

    itemUnderMouse:function(){
        for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
            var center = getCenterOfUnitDrawing(item);
            if (item.type=="staticUnits") {
                if(item.lifeCode != "dead" &&
                   item.drawingX <= mouse.mapX &&
                   item.drawingX >= mouse.mapX - item.baseWidth &&
                   item.drawingY <= mouse.mapY &&
                   item.drawingY >= mouse.mapY - item.baseHeight)
                {
                    return item;
                }
           } else {
                if (item.lifeCode != "dead" &&
                    Math.pow(center.x - mouse.mapX, 2) +
                    Math.pow(center.y - mouse.mapY, 2) <
                    Math.pow(item.radius * 1.3, 2))
                {
                    return item;
                }
            }
        }
    },

    calculateGameCoordinates:function() {
        mouse.mapX = mouse.x + game.offsetX ;
        mouse.mapY = mouse.y + game.offsetY;

        mouse.gridX = Math.floor(mouse.mapX / game.squareSize);
        mouse.gridY = Math.floor(mouse.mapY / game.squareSize);
    },

    // START HANDLER
    mouseMoveHandler:function(ev) {
        mouse.x = ev.clientX;
        mouse.y = ev.clientY;

        mouse.calculateGameCoordinates();
    },

    mouseDownHandler:function(ev) {
        if (ev.which == 1) {// Left click
            var clickedItem = mouse.itemUnderMouse();

            if (clickedItem) {// Player clicked on sth
                if (clickedItem.type != "terrain") {
                game.displayMessage(clickedItem.name+" selected("+clickedItem.x+","+clickedItem.y+")", 2500, "error");

                    if (clickedItem.team == game.team) {
                        // Player clicked on friendly unit

                        if(game.state == "selectFriendlyUnit") {
                            game.targetSelected(clickedItem);
                        } else {
                            game.clearSelection();
                            game.selectItem(clickedItem);
                        }
                    } else {
                        // Player clicked on enemy unit

                        if(game.state == "selectEnemyUnit") {
                            game.targetSelected(clickedItem);
                        } else {
                            game.sendCommand(game.selectedItem.uid, {type:"attack", to:clickedItem});
                        }
                    }
                }
            } else if (game.selectedItem &&
                       game.selectedItem.team == game.team &&
                       game.selectedItem.movable) {
                // Player has own unit selected and clicked
                // somewhere on map
                if(game.state == "selectSquare") {
                    game.targetSelected({x:mouse.gridX, y:mouse.gridY});
                } else {
                    game.sendCommand(game.selectedItem.uid, {type:"move", to:{x:mouse.gridX, y:mouse.gridY}});
                }
            }
        } else if (ev.which == 3) {// Right click
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

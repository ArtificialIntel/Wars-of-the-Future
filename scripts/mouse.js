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
    leftDown:false,
    dragging:false,
    insideCanvas:false,

    init:function(){
        var mouseCanvas = $('#foregroundCanvas');

        mouseCanvas.mousemove(mouse.mouseMoveHandler);
        mouseCanvas.click(mouse.clickHandler);
        mouseCanvas.mousedown(mouse.mouseDownHandler);
        mouseCanvas.mouseup(mouse.mouseUpHandler);
        mouseCanvas.mouseleave(mouse.mouseLeaveHandler);
        mouseCanvas.mouseenter(mouse.mouseEnterHandler);

        mouseCanvas.bind('contextmenu',function(ev){
            mouse.click(ev,true);
            return false;
        });
    },

    click:function(ev, rightClick){
    },

    draw:function(){
        if(this.dragging){
            var x = Math.min(this.mapX,this.dragX);
            var y = Math.min(this.mapY,this.dragY);
            var width = Math.abs(this.mapX-this.dragX)
            var height = Math.abs(this.mapY-this.dragY)
            game.foregroundContext.strokeStyle = 'white';
            game.foregroundContext.strokeRect(x-game.offsetX,y-game.offsetY, width, height);
        }
    },
	
    calculateGameCoordinates:function(){
		mouse.mapX = mouse.x + game.offsetX ;
		mouse.mapY = mouse.y + game.offsetY;

		mouse.gridX = Math.floor((mouse.mapX) / game.squareSize);
		mouse.gridY = Math.floor((mouse.mapY) / game.squareSize);	
	},

    // START HANDLER
    mouseMoveHandler:function(ev){
        var offset = $('#foregroundCanvas').offset();
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;

        mouse.calculateGameCoordinates();

        if(mouse.leftDown){
            if((Math.abs(mouse.dragX - mouse.mapX) > 4 || Math.abs(mouse.dragY - mouse.mapY) > 4)){
                    mouse.dragging = true
            }
        } else {
            mouse.dragging = false;
        }
    },

    mouseClickHandler:function(ev){
        console.log('calling mouseclick');
        mouse.click(ev,false);
        mouse.dragging = false;
        return false;
    },

    mouseDownHandler:function(ev){
        console.log('calling mousedown');
        if(ev.which == 1){
            mouse.leftDown = true;
            mouse.dragX = mouse.mapX;
            mouse.dragY = mouse.mapY;
            ev.preventDefault();
        }
        return false;
    },

    mouseUpHandler:function(ev){
        var shiftPressed = ev.shiftKey;
        if(ev.which == 1){
            mouse.leftDown = false;
            mouse.dragging = false;
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

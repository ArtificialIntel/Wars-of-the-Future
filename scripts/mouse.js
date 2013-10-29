var mouse = {
    x:0,
    y:0,
    down:false,
    init:function(){
        $('#mainCanvas').mousemove(mouse.mouseMoveHandler);
        $('#mainCanvas').mousedown(mouse.mouseDownHandler);
        $('#mainCanvas').mouseup(mouse.mouseUpHandler);
        $('#mainCanvas').mouseout(mouse.mouseOutHandler);
    },
    mouseMoveHandler:function(ev){
        var offset = $('#mainCanvas').offset();

        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;

        if(mouse.down){
            mouse.dragging = true;
        }
    },
    mouseDownHandler:function(ev){
        console.log("mouse down");
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
    },
    mouseUpHandler:function(ev){
        console.log("mouse up");
        mouse.down = false;
        mouse.dragging = false;
    }
}

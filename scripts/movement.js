function findAngle(object, unit, directions){
    var centerOfUnit = getCenterOfUnit(unit);
    var dx = (object.x) - (centerOfUnit.x);
    var dy = (object.y) - (centerOfUnit.y);
    //Convert Arctan to value between (0 - 7)
    var angle = wrapDirection(directions / 2 - (Math.atan2(dx,dy) *directions / (2*Math.PI)), directions);
    return angle;
 }

function angleDiff(angle1, angle2, directions) {
    if(angle1 >= directions / 2){
        angle1 = angle1 - directions;
    }

    if(angle2 >= directions / 2){
        angle2 = angle2 - directions;
    }

    diff = angle2 - angle1;

    if(diff < -directions / 2){
        diff += directions;
    }

    if(diff > directions / 2){
        diff -= directions;
    }

    return diff;
}

function wrapDirection(direction, directions){
    if(direction < 0){
        direction += directions;
    }

    if(direction >= directions){
        direction -= directions;
    }

    return direction;
}

function moveUnitTo(unit, destination) {
    // Find out where we need to turn to get to destination
    var newDirection = findAngle(destination, unit, unit.directions);
    // Calculate difference between new direction and current direction
    var difference = angleDiff(unit.direction, newDirection, unit.directions);
    // Calculate amount that unit can turn per animation cycle
    var turnAmount = unit.turnSpeed * game.turnSpeedAdjustmentFactor;
    if (Math.abs(difference) > turnAmount) {
        unit.direction = wrapDirection(parseFloat(unit.direction) + turnAmount * Math.abs(difference) / difference, unit.directions);
    } else {
        var movement = unit.animationSpeed * game.speedAdjustmentFactor;
        var angleRadians = -(Math.round(unit.direction) / unit.directions) * 2 * Math.PI;
        unit.lastMovementX = - (movement * Math.sin(angleRadians));
        unit.lastMovementY = - (movement * Math.cos(angleRadians));
        unit.drawingX = (unit.drawingX + unit.lastMovementX * game.squareSize);
        unit.drawingY = (unit.drawingY + unit.lastMovementY * game.squareSize);

        var centerOfUnit = getCenterOfUnit(unit);
        unit.x = Math.floor(centerOfUnit.x / game.squareSize);
        unit.y = Math.floor(centerOfUnit.y / game.squareSize);
    }
}

// Moves a given unit to given square
// Returns true when unit has reached square
function moveUnitToSquare(unit, x, y) {
    // Calculate coordinates in px of
    // the top left corner of the square
    var destination = {
        x:x * game.squareSize - game.offsetX,
        y:y * game.squareSize - game.offsetY
    };

    var destinationCenter = {
        x:destination.x + game.squareSize / 2,
        y:destination.y + game.squareSize / 2,
    };

    var centerOfUnit = getCenterOfUnit(unit);

    // Stop when the center of the unit is within squareSize / 4 pixels
    // of the destination square's center
    if (Math.abs(centerOfUnit.x - destinationCenter.x) < game.squareSize / 5 && Math.abs(centerOfUnit.y - destinationCenter.y) < game.squareSize / 5) {
        return true;
    }

    moveUnitTo(unit, destinationCenter);
    return false;
}

function getCenterOfUnit(unit) {
    var flightHeight = 0;
    if(unit.isFlying) {
        flightHeight = unit.pixelShadowHeight;
    }
    return {
        x:unit.drawingX + unit.pixelWidth / 2,
        y:unit.drawingY + unit.pixelHeight / 2 + flightHeight
    };
}

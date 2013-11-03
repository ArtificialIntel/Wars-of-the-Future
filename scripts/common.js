// Set up requestAnimationFrame and cancelAnimationFrame for use in the game code
(function() {
    var lastTime =0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currentTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currentTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currentTime + timeToCall); }, timeToCall);
                lastTime = currentTime + timeToCall;
                return id;
        }
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var loader = {
    loaded:true,
    loadedCount:0,
    totalCount:0,

    init:function(){
        var mp3Support,oggSupport;
        var audio = document.createElement('audio');
        if(audio.canPlayType){
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            mp3Support = false;
            oggSupport = false;
        }

        loader.soundFileExtension= oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingScreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },

    itemLoaded:function(){
        loader.loadedCount++;
        $('#loadingMessage').html('Loaded ' + loader.loadedCount + ' of ' + loader.totalCount);
        if (loader.loadedCount == loader.totalCount) {
            loader.loaded = true;
            $('#loadingScreen').hide();
            if (loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}

// Loads an item(unit) including sprites
function loadItem(name){
    var item = this.units[name];
    if(item.spriteArray){
        // item was already loaded
        return;
    }
    item.spriteSheet = loader.loadImage('images/'+this.defaults.type+'/'+name+'.png');
    item.spriteArray = [];
    item.spriteCount = 0;

    for (var i=0; i < item.spriteImages.length; i++){
        var constructImageCount = item.spriteImages[i].count;
        var constructDirectionCount = item.spriteImages[i].directions;
        if (constructDirectionCount){
            for (var j=0; j < constructDirectionCount; j++) {
                var constructImageName = item.spriteImages[i].name +"-"+j;
                item.spriteArray[constructImageName] = {
                    name:constructImageName,
                    count:constructImageCount,
                    offset:item.spriteCount
                };
                item.spriteCount += constructImageCount;
            };
        } else {
            var constructImageName = item.spriteImages[i].name;
            item.spriteArray[constructImageName] = {
                name:constructImageName,
                count:constructImageCount,
                offset:item.spriteCount
            };
            item.spriteCount += constructImageCount;
        }

    }
}

function addItem(details){
    var item = {};
    var name = details.name;
    // Apply defaults for entity type
    $.extend(item,this.defaults);
    // Add the properties specific for the unit
    $.extend(item,this.units[name]);
    item.life = item.hitPoints;
    $.extend(item,details);
    return item;
}

function findAngle(object, unit, directions){
     var dy = (object.y) - (unit.y);
     var dx = (object.x) - (unit.x);
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

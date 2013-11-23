var maps = {
    "singleplayer":[
        {
            "name":"Default",
            "mapImage":"images/maps/terrainMap.png",
            "gridImage":"images/maps/20x20grid.png",
            "startX":0,
            "startY":0,

            // Items to be loaded before game can start
            "requirements":{
			    "staticUnits":["base"],
			    "dynamicUnits":["transport"],
			    "movableUnits":["chopper"],
			    "terrain":["bigrocks"]
			},

            "items":[
                // x and y are specified in # of squares on grid
			    {"type":"staticUnits","name":"base","x":15,"y":17,"team":"A"},
			    {"type":"dynamicUnits","name":"transport","x":13,"y":17,"team":"A","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":12,"y":17,"team":"A","direction":"2"},
			    {"type":"staticUnits","name":"base","x":Math.random(5),"y":Math.random(5),"team":"B"},
			    {"type":"dynamicUnits","name":"transport","x":10,"y":7,"team":"B","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":5,"y":12,"team":"B","direction":"2"},
			    {"type":"terrain","name":"bigrocks","x":15,"y":15}
            ]
        },
    ]
};

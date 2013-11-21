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
			    "dynamicUnits":["transport1"],
			    "movableUnits":["chopper"],
			    "terrain":["bigrocks"]
			},

            "items":[
                // x and y are specified in # of squares on grid
			    {"type":"staticUnits","name":"base","x":3,"y":4,"team":"A"},
			    {"type":"dynamicUnits","name":"transport1","x":10,"y":14,"team":"A","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":6,"y":8,"team":"A","direction":"2"},
			    {"type":"terrain","name":"bigrocks","x":15,"y":15}
            ]
        },
    ]
};

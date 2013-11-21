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
<<<<<<< HEAD
			    {"type":"dynamicUnits","name":"transport1","x":10,"y":14,"team":"A","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":6,"y":8,"team":"A","direction":"2"},
=======
			    {"type":"dynamicUnits","name":"transport","x":10,"y":14,"team":"B","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":8,"y":13,"team":"A","direction":"2"},
>>>>>>> 6b112cebc249f74648a8866a6c60365c13122c90
			    {"type":"terrain","name":"bigrocks","x":15,"y":15}
            ]
        },
    ]
};

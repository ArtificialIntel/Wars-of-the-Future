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
			    "staticUnits":["gym","armory","tower"],
			    "dynamicUnits":["dragon","hamster","turtle"],
			    "movableUnits":["sniper","troll","horseman"],
			    "terrain":["bigrocks"]
			},

            "items":[
                // x and y are specified in # of squares on grid
			    {"type":"staticUnits","name":"gym","x":2,"y":3,"team":"B"},
			    {"type":"dynamicUnits","name":"dragon","x":10,"y":7,"team":"B","direction":"0"},
			    {"type":"movableUnits","name":"horseman","x":5,"y":12,"team":"B","direction":"2","counter":5},
			    {"type":"terrain","name":"bigrocks","x":15,"y":15}
            ]
        },
    ]
};

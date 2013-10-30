var maps = {
    "singleplayer":[
        {
            "name":"Introduction",
            "mapImage":"images/maps/level-one-debug-grid.png",
            "startX":0,
            "startY":0,

            // Items to be loaded before game can start
            "requirements":{
			    "staticUnits":["base"],
			    "dynamicUnits":[],
			    "movableUnits":[],
			    "terrain":[]
			},

            "items":[
			    {"type":"staticUnits","name":"base","x":11,"y":14,"team":"A"}
            ]
        },
    ]
};

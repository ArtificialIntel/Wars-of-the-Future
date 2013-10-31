var maps = {
    "singleplayer":[
        {
            "name":"Introduction",
            "mapImage":"images/maps/20x20map.png",
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
			    {"type":"staticUnits","name":"base","x":3,"y":4,"team":"A"},
			    {"type":"dynamicUnits","name":"transport","x":10,"y":14,"team":"A","direction":"0"},
			    {"type":"movableUnits","name":"chopper","x":5,"y":5,"team":"A","direction":"2"},
			    {"type":"terrain","name":"bigrocks","x":15,"y":15}
            ]
        },
    ]
};

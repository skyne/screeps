var CreepScout = require('CreepScout');
var CreepBase = require('CreepBase');
var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');

const MAX_SCOUTS =1;

var ScoutHandler = {
};

ScoutHandler.scouts = [];

ScoutHandler.loadScouts = function() {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var role = creep.memory.role || creep.name.split('-')[0];
        if(role == 'CreepScout') {
            var c = new CreepScout(creep, this.roomHandler);
            HelperFunctions.extend(c, CreepBase);
            c.init();
        }
    }
};

ScoutHandler.spawnNewScouts = function(force = false) {
    var rooms = RoomHandler.getRoomHandlers();
    
    let allScoutPopulation = 0;
    
    for(var n in rooms) {
        var room = rooms[n];
        const scoutsInRoom = room.population.getType('CreepScout').total;
        allScoutPopulation += scoutsInRoom;
    }
    
    console.log(`GLOBAL: scout total population = ${allScoutPopulation}/${MAX_SCOUTS}`);
    
    for(var n in rooms) {
        var room = rooms[n];
        if(!rooms[n].depositManager.getSpawnDeposit()) {
            continue;
        }
        
        const goalsmet = allScoutPopulation < MAX_SCOUTS;
        if((goalsmet && room.constructionManager.getController().level >= 2) || force) {
            console.log(rooms[n].room.name + ' should expand.');
            rooms[n].creepFactory.new('CreepScout', rooms[n].depositManager.getSpawnDeposit());
        }
    }
}

module.exports = ScoutHandler;

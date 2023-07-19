var CreepScout = require('CreepScout');
var CreepBase = require('CreepBase');
var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');

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

ScoutHandler.setRoomHandler = function(roomHandler) {
    console.log('DEPRECATED!')
};

ScoutHandler.spawnNewScouts = function() {
    var rooms = RoomHandler.getRoomHandlers();
    for(var n in rooms) {
        var room = rooms[n];
        if(!rooms[n].depositManager.getSpawnDeposit()) {
            continue;
        }
        if(room.population.goalsMet() == true && room.constructionManager.getController().level >= 4) {
            console.log(rooms[n].room.name + ' should expand.');
            rooms[n].creepFactory.new('CreepScout', rooms[n].depositManager.getSpawnDeposit());
        }
    }
}

module.exports = ScoutHandler;

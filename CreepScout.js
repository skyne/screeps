var Cache = require('Cache');
var CreepScout = function(creep, roomHandler) {
    this.cache = new Cache();
    this.creep = creep;
    this.roomHandler = roomHandler;
};

CreepScout.prototype.init = function() {
    this.remember('role', 'CreepScout');
    this.remember('visitedRooms', []);
    if(this.remember('role')) {
        this.remember('roomName', this.creep.room.name);
    }

    var scoutflags = Object.values(Game.flags).filter((o) => o.name.toLowerCase().includes('scout'))
    const unvisitedFlags = scoutflags.filter((o) => !this.remember('visitedRooms').includes(o.room.name));
        if(unvisitedFlags.length != 0) {
            this.remember('targetRoom', unvisitedFlags[0].room.name);
        }

    if(this.moveToNewRoom() == true) {
		return;
	}
    if(this.avoidEnemy()) {
        return;
    }
    this.act();
};

CreepScout.prototype.avoidEnemy = function() {
    return true;
};

CreepScout.prototype.act = function() {
    if(this.remember('targetRoom') === this.creep.room.name) {
        if(!this.remember('visitedRooms').includes(this.creep.room.name){
            this.remember('visitedRooms', this.remember('visitedRooms').concat([this.creep.room.name]));
        } 

        var flag = Object.values(Game.flags).filter((o) => o.name.toLowerCase().includes('scout') && o.room.name === this.creep.room.name)[0];
        this.creep.moveTo(flag, {visualizePathStyle: {stroke: '#ff0000'}});
        

    }
    this.conquer();
};

CreepScout.prototype.findController = function() {
    return this.creep.room.find(
        FIND_STRUCTURES,
        {
            filter: function(structure) {
                if(structure.structureType == STRUCTURE_CONTROLLER) {
                    return true;
                }

                return false;
            }
        }
    );
};

CreepScout.prototype.conquer = function() {
    var controller = this.findController();
    if(controller.length != 0) {
        controller = controller[0];
    }

    this.creep.moveTo(controller);
    this.creep.claimController(controller);
}

module.exports = CreepScout;

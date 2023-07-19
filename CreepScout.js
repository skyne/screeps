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

CreepScout.prototype.moveToNewRoom = function() {
    var scoutflags = Game.flags.filter((o) => o.name.toLowerCase.includes('scout'))
    if(this.remember('roomName') != this.creep.room.name) {
        var exitDir = this.creep.room.findExitTo(this.remember('roomName'));
        var exit = this.creep.pos.findClosestByRange(exitDir);
        this.creep.moveTo(exit);
        return true;
    }
    if(scoutflags.length != 0) {

        const unvisitedFlags = scoutflags.filter((o) => !this.remember('visitedRooms').includes(o.room.name));
        if(unvisitedFlags.length != 0) {
            var exitDir = this.creep.room.findExitTo(unvisitedFlags[0].room.name);
            var exit = this.creep.pos.findClosestByRange(exitDir);
            this.creep.moveTo(exit);
            return true;
        }
        return false;
    }
    return false;
};

CreepScout.prototype.act = function() {
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

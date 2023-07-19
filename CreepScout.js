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
    return false;
};

CreepScout.prototype.act = function() {  
    if(!this.remember('targetRoom')) {
        var scoutflags = Object.values(Game.flags).filter((o) => o.name.toLowerCase().includes('scout'))
        const unvisitedFlags = scoutflags.filter((o) => !this.remember('visitedRooms').includes(o.pos.roomName) && o.pos.roomName != this.creep.room.name);
        if(unvisitedFlags.length != 0) {
            this.remember('targetRoom', unvisitedFlags[0].pos.roomName);
            console.log(this.creep.name + ' is scouting ' + this.remember('targetRoom'));
        }
        else {
            this.remember('targetRoom', false);
        }
    }
    else{
        console.log(this.creep.name + ' is idle in ' + this.creep.room.name);
    }
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

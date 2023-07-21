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
    
    if(this.creep.room.controller && !this.creep.room.controller.my) {
        //console.log(this.creep.name + ' is conquering in ' + this.creep.room.name);
        if(this.conquer())
        return;
        
    }
    
    
    if(!this.remember('targetRoom')) {
        var scoutflags = Object.values(Game.flags).filter((o) => o.name.toLowerCase().includes('scout'))
        const unvisitedFlags = scoutflags.filter((o) => !this.remember('visitedRooms').includes(o.pos.roomName) && o.pos.roomName != this.creep.room.name);
        if(unvisitedFlags.length != 0) {
            this.remember('targetRoom', unvisitedFlags[0].pos.roomName);
            this.creep.say(this.remember('targetRoom'));
            //console.log(this.creep.name + ' is scouting ' + this.remember('targetRoom'));
        }
        else {
            this.remember('targetRoom', false);
        }
    }
    


    if(!this.remember('targetRoom')){
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
    var controller = this.creep.room.controller; //this.findController();

    //this.creep.moveTo(40,17)
    //return true


    if(!this.creep.pos.inRangeTo(controller, 1)){
        const moveres = this.creep.moveTo(controller);
        
        if(moveres === -2){
            console.log(`${this.creep.name} cannot move to ${controller.pos} from ${this.creep.pos}`)
            var scoutflagInRoom = Object.values(Game.flags).filter((o) => o.name.toLowerCase().includes('scout') && o.room.id === this.creep.room.id)[0]
            this.creep.moveTo(scoutflagInRoom.pos);
        }
         this.creep.say(`m ${controller.id}`)
        return true;
    }
    else{
        if(this.creep.body.indexOf("CLAIM") > -1) {
            this.creep.say(`c ${controller.id}`)
            this.creep.claimController(controller);
            return true;
        }
        else {
            this.creep.say(`r ${controller.id}`)
            //this.creep.reserveController(controller);
            return true;
        }
    }
    
    return false;
}

module.exports = CreepScout;

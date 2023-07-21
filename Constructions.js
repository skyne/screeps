var CONST = {
    RAMPART_MAX: 200000,
    RAMPART_FIX: 50000,
};
var Cache = require('Cache');
var roomHandler = require('RoomHandler');

function Constructions(room) {
    this.room = room;
    this.cache = new Cache();
    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.structures = this.room.find(FIND_MY_STRUCTURES);
    this.damagedStructures = this.getDamagedStructures();
    this.upgradeableStructures = this.getUpgradeableStructures();
    this.controller = this.room.controller;
};


Constructions.prototype.getDamagedStructures = function() {
    let structures = this.room.find(
        FIND_STRUCTURES,
        {
            filter: function(s) {
                var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);

				if(targets && targets.length != 0) {
				    return false;
				}
				
                //TODO check if we are in an owned room to fix `neutral` structures (e.g.: walls as well)
                
                if((s.hits < s.hitsMax/2 && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_FIX)) {
                    return true;
                }
                return false
            }
        }
    );
    
    const myStructures = this.room.find(FIND_MY_STRUCTURES);
    
    structures.sort((a,b) => {

        const indexAInMy = myStructures.findIndex((o) => o.id === a.id);
        const indexBInMy = myStructures.findIndex((o) => o.id === b.id);
        if(indexAInMy >= 0 && indexBInMy === -1) {
            return -1;
        }
        if(indexBInMy >= 0 && indexAInMy === -1) {
            return 1;
        }
        else {
            return 0;
        }
    })
    
    return structures;
};

Constructions.prototype.getUpgradeableStructures = function() {
    return this.room.find(
        FIND_MY_STRUCTURES,
        {
            filter: function(s) {
                var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if(targets.length != 0) {
                    return false;
                }

                if((s.hits < s.hitsMax && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_MAX)) {

                    return true;
                }
            }
        }
    );
};

Constructions.prototype.getConstructionSiteById = function(id) {
    return this.cache.remember(
        'object-id-' + id,
        function() {
            return Game.getObjectById(id);
        }.bind(this)
    );
};

Constructions.prototype.getController = function() {
    return this.controller;
};

Constructions.prototype.getClosestConstructionSite = function(creep) {
    var site = false;
    if(this.sites.length != 0) {
        site = creep.pos.findClosestByRange(this.sites);
    }

    return site;
};


Constructions.prototype.constructStructure = function(creep) {
    var avoidArea = creep.getAvoidedArea();
    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.sites.sort((a,b) => a.progress > b.progress ? -1 : (b.progress > a.progress ? 1 : 0))
    var site = undefined;

    //TODO: priorities repair on own structures, then build, then repair neutrals

    if(this.sites.length != 0) {
        //creep.creep.pos.findClosestByRange(this.sites);
        site = this.sites[0]
        creep.creep.say(`b ${site.id.substring(site.id.length - 6)}`)
        creep.creep.moveTo(site); //, {avoid: avoidArea});
        creep.creep.build(site);

        return site;
    }

    if(this.damagedStructures.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.damagedStructures);
        creep.creep.say(`r ${site.id.substring(site.id.length - 6)}`)
        creep.creep.moveTo(site); //, {avoid: avoidArea});
        creep.creep.repair(site);

        return site;
    }

    if(this.upgradeableStructures.length != 0) {
        site = creep.creep.pos.findClosestByRange(this.upgradeableStructures);
        creep.creep.say(`u ${site.id.substring(site.id.length - 6)}`)
        creep.creep.moveTo(site); //, {avoid: avoidArea});
        creep.creep.repair(site);

        return site;
    }

    return false;
};


module.exports = Constructions;

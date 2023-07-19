/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};

function CreepMiner(creep, resourceManager, population) {
	this.cache = new Cache();
	this.creep = creep;
	this.resourceManager = resourceManager;
	this.resource = false;
	this.population = population;
};

CreepMiner.prototype.init = function() {
	this.remember('role', 'CreepMiner');

	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		this.remember('source', false)
		return;
	}

	this.resource = this.resourceManager.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

	this.giveEnergy();
	if(this.creep.carry.energy == this.creep.carryCapacity) {
	    var creepsNear = this.creep.pos.findInRange(1);
	
    	if(creepsNear.length){

    		for(var n in creepsNear){
    			if(creepsNear[n].memory.role === 'CreepCarrier' && creepsNear[n].carry.energy != creepsNear[n].carryCapacity){
    				return;
    			}
    		}
    	}
    	else if(this.population && this.population.getTotalPopulationOfType('CreepCarrier') > 0){
			console.log(this.population.getTotalPopulationOfType('CreepCarrier'));
    	    this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
            return;
    	}
	    else {
			var targets = this.creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
						structure.energy < structure.energyCapacity;
				}
			});
			if(targets.length > 0) {
				if(this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					this.creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0000'}});
				}
			}
	    }
	}
	this.creep.moveTo(this.resource, {visualizePathStyle: {stroke: '#ffffff'}});
	this.creep.harvest(this.resource);
	this.remember('last-energy', this.creep.carry.energy);
}

CreepMiner.prototype.giveEnergy = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepMiner'){
				if(creepsNear[n].memory['last-energy'] == creepsNear[n].carry.energy && creepsNear[n].carry.energy < creepsNear[n].carryCapacity) {
					this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
				}
			}
		}
	}
}

module.exports = CreepMiner;

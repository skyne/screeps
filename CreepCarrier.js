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
var DEPOSIT_FOR = {
	CONSTRUCTION: 1,
	POPULATION: 2
}

function CreepCarrier(creep, depositManager, resourceManager, constructionsManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.depositManager = depositManager;
	this.resourceManager = resourceManager;
	this.constructionsManager = constructionsManager;
	this.resource = false;
	this.target = false;
};

CreepCarrier.prototype.init = function() {
	this.remember('role', 'CreepCarrier');
	this.depositFor = this.remember('depositFor') || RESOURCE_ENERGY;
	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	} else {
		this.resource = this.resourceManager.getResourceById(this.remember('source'));
	}
	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		//this.creep.say('w');
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}

	if(this.moveToNewRoom() == true) {
		return;
	}

	if(this.randomMovement() == false) {
	    this.act();
	}
};

CreepCarrier.prototype.onRandomMovement = function() {
	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepCarrier.prototype.setDepositFor = function(type) {
	this.remember('depositFor', type);
}
CreepCarrier.prototype.getDepositFor = function() {
	return this.remember('depositFor');
}

CreepCarrier.prototype.act = function() {
    var continueDeposit = false;
	if(this.creep.carry.energy != 0 && this.remember('last-action') == ACTIONS.DEPOSIT) {
		continueDeposit = true;
	}

	this.pickupEnergy();

	if(this.creep.carry.energy < this.creep.carryCapacity && continueDeposit == false) {
		this.harvestEnergy();
	} else {
		this.depositEnergy();
	}
};

CreepCarrier.prototype.depositEnergy = function() {
	var avoidArea = this.getAvoidedArea();

	if(this.depositManager.getEmptyDeposits().length == 0 && this.depositManager.getSpawnDeposit().energy == this.depositManager.getSpawnDeposit().energyCapacity) {
		this.depositFor = DEPOSIT_FOR.CONSTRUCTION;
	}

	if(this.depositManager.energy() / this.depositManager.energyCapacity() < 0.3) {
		this.depositFor = DEPOSIT_FOR.POPULATION;
	}

	if(this.depositFor == DEPOSIT_FOR.POPULATION) {
		var deposit = this.getDeposit();
		this.creep.say('deposit');
		this.creep.moveTo(deposit, {visualizePathStyle: {stroke: '#0000ff'}});
		this.creep.transfer(deposit, RESOURCE_ENERGY);
	}

	if(this.depositFor == DEPOSIT_FOR.CONSTRUCTION) {
		var worker = this.getWorker();
		var range = 1;
		if(!worker) {
			worker = this.constructionsManager.controller;
			range = 2;
		}

		if(!this.creep.pos.isNearTo(worker, range)) {
			this.creep.say('transfer');
			this.creep.moveTo(worker, {visualizePathStyle: {stroke: '#ff00ff'}});
		} else {
			this.remember('move-attempts', 0);
		}
		this.harvest();
	}

	this.remember('last-action', ACTIONS.DEPOSIT);
}

CreepCarrier.prototype.getWorker = function() {
	if(this.remember('target-worker')) {
		return Game.getObjectById(this.remember('target-worker'));
	}

	return false;
}
CreepCarrier.prototype.getDeposit = function() {
	return this.cache.remember(
		'selected-deposit',
		function() {
			var deposit = false;

			// Deposit energy
			if(this.remember('closest-deposit')) {
				deposit = this.depositManager.getEmptyDepositOnId(this.remember('closest-deposit'));
			}

			if(!deposit) {
				deposit = this.depositManager.getClosestEmptyDeposit(this.creep);
				this.remember('closest-deposit', deposit.id);
			}

			if(!deposit) {
				deposit = this.depositManager.getSpawnDeposit();
			}

			return deposit;
		}.bind(this)
	)
};
CreepCarrier.prototype.pickupEnergy = function() {
	var avoidArea = this.getAvoidedArea();

	if(this.creep.carry.energy < this.creep.carryCapacity) {
		return false;
	}

	var target = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES,2);

	if(target.length) {
	    this.creep.pickup(target[0]);
	}
};
CreepCarrier.prototype.harvestEnergy = function() {
	//this.creep.moveTo(0,0);
	var avoidArea = this.getAvoidedArea();

	this.creep.say('harvest site');
	this.creep.moveTo(this.resource, {visualizePathStyle: {stroke: '#ffffff'}}); //, {avoid: avoidArea});
	if(this.creep.pos.inRangeTo(this.resource, 3)) {
		this.harvest();
	}
	this.remember('last-action', ACTIONS.HARVEST);
	this.forget('closest-deposit');
}

CreepCarrier.prototype.harvest = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_CREEPS,3)
	
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepMiner' && creepsNear[n].carry.energy != 0){
				this.creep.say('to transfer');
				this.creep.moveTo(creepsNear[n].pos, {visualizePathStyle: {stroke: '#ffffff'}});
				//creepsNear[n].transfer(this.creep, RESOURCE_ENERGY);
				creepsNear[n].transfer(this.creep, RESOURCE_ENERGY);
			}
            if(creepsNear[n].memory.role === 'CreepBuilder'){
                this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
			}
		}
	}
}

module.exports = CreepCarrier;

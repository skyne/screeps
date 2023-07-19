var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');
var ScoutHandler = require('ScoutHandler');
var myRoom = require('myRoom');
var CreepBase = require('CreepBase');
var CreepScout = require('CreepScout');

//ScoutHandler.setRoomHandler(RoomHandler);

// Init rooms 
for(var n in Game.rooms) {
	var roomHandler = new myRoom(Game.rooms[n], RoomHandler);
    RoomHandler.set(Game.rooms[n].name, roomHandler);
};

// Load rooms
var rooms = RoomHandler.getRoomHandlers();
for(var n in rooms) {
	var room = rooms[n];
	room.loadCreeps();
	room.populate();
  
	console.log(
		room.room.name + ' | ' +
		'population: ' +
		room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
		' ( B:' + room.population.getType('CreepBuilder').total + '/' + room.population.getType('CreepBuilder').max +
		' #M: ' + room.population.getType('CreepMiner').total + '/' + room.population.getType('CreepMiner').max +
		' #C: ' + room.population.getType('CreepCarrier').total + '/' + room.population.getType('CreepCarrier').max +
		' #S: ' + room.population.getType('CreepSoldier').total + '/' + room.population.getType('CreepSoldier').max +
		' #SS: ' + room.population.getType('CreepScout').total + '/' + room.population.getType('CreepScout').max +
		'), ' +
		'resources at: ' + parseInt( (room.depositManager.energy() / room.depositManager.energyCapacity())*100) +'%, ' +
		'max resources: ' + room.depositManager.energyCapacity() +'u, ' +
		'next death: ' + room.population.getNextExpectedDeath() +' ticks'
	);
};

// Load scouts.
//ScoutHandler.loadScouts();
//ScoutHandler.spawnNewScouts();

HelperFunctions.garbageCollection();

import {DroneModel} from '../Model/DroneModel.js';
import {DroneView} from '../View/DroneView.js';

export class DroneController {
	#drones;
	#nextDroneId;
	#droneDefaultData;

	constructor() {
		if(!!DroneController.instance){
			return DroneController.instance;
		}

		this.drones = {};
		this.nextDroneId = 0;
		this.#droneDefaultData = {
			speed: 60,
			height: 30
		};

		DroneController.instance = this;
		return this;
	};

	// Getters
	get drones () {
		return this.#drones;
	};
	get nextDroneId () {
		return this.#nextDroneId;
	};
	get droneDefaultData () {
		return this.#droneDefaultData;
	};

	// Setters
	set drones (drones) {
		this.#drones = drones;
	};
	set nextDroneId (nextDroneId) {
		this.#nextDroneId = nextDroneId;
	};

	// Functions
	generateDroneId () {
		let droneId = this.nextDroneId;
		this.nextDroneId += 1;
		return droneId;
	};

	clearMap (map) {
		Object.values(this.drones).forEach((drone) => {
			map.removeLayer(drone.view.droneAnimation.vectorAnimation);
			drone.model.updateStatus(drone.model.codes.EXIT_SIMULLATION, "Clear Map");
		});

		this.drones = {};
	};

	startDroneSimulation (mapData, environmentObserver, dronesData) {
		// just for testing multiple drones
		const randomNumber = (min, max) => {return parseInt(Math.random() * (max - min) + min);};

		this.clearMap(mapData.map);

		let waypoints = mapData.waypoints;
		let waypointsDistances = mapData.waypointsDistances;
		let droneHeight = 0;

		console.log(dronesData);

		Object.keys(waypoints).forEach((routeId, i) => {
			
			if (routeId in dronesData) {
				Object.keys(dronesData[routeId]).forEach((id) => {

					// Cod: "Route ID - Drone ID - Last Drone Number"
					let droneId = routeId + "-" + id + "-" + this.generateDroneId();
					let droneSpeed = dronesData[routeId][id].speed;
					let droneHeight = dronesData[routeId][id].height;

					let drone = {
						model: new DroneModel(droneId, droneSpeed, droneHeight, environmentObserver),
						view: new DroneView()
					};

					this.drones[droneId] = drone;

					drone.model.waypoints = waypoints[routeId];
					drone.model.waypointsDistances = waypointsDistances[i];
					drone.view.startDroneSimulation(mapData, drone);

				});
			} else {

				let id = 'X';
				let droneId = routeId + "-" + id + "-" + this.generateDroneId();
				let droneSpeed = this.droneDefaultData.speed;
				let droneHeight = this.droneDefaultData.height;

				let drone = {
					model: new DroneModel(droneId, droneSpeed, droneHeight, environmentObserver),
					view: new DroneView()
				};

				this.drones[droneId] = drone;

				drone.model.waypoints = waypoints[routeId];
				drone.model.waypointsDistances = waypointsDistances[i];
				drone.view.startDroneSimulation(mapData, drone);

			};

		});
		
		/*waypoints.forEach((coords, i) => {
			for (let j = 0; j < randomNumber(1,4); j++){
				let droneId = "Drone_" + this.generateDroneId();
				let droneSpeed = 20 + 20 * randomNumber(2,10);
				droneHeight += 30;

				let drone = {
					model: new DroneModel(droneId, droneSpeed, droneHeight, environmentObserver),
					view: new DroneView()
				};

				this.drones[droneId] = drone;

				drone.model.waypoints = coords;
				drone.model.waypointsDistances = waypointsDistances[i];
				drone.view.startDroneSimulation(mapData, drone);
			};
			droneHeight = 0;
		});*/

	};

	getAllOfDroneHeights (opponentDrone) {
		let data = [];

		try {
			for (let i in opponentDrone) {
				let droneId = opponentDrone[i].droneId;
				data.push({
					height: this.drones[droneId].model.height,
					distance: opponentDrone[i].distance
				});
			};
			return data;	
		} catch(e) {
			console.log("Removing removed drone propagation.");
			return false;
		};
	};

	update (data) {
		/*
			Update acontece por drone, e a progagação de uma chamada de drone pode se manter em uma 
			próxima execução. Para evita isso, o número da execução do drone é verificada.
		*/

		let droneId = data.droneId;
		let envData = data.envData;
		let opponentDrone = this.getAllOfDroneHeights(data.opponentDrone);

		// Update de drone já removido
		if (!opponentDrone) { return; };

		this.drones[droneId].model.dataEnv = envData;
		this.drones[droneId].model.opponentDrone = opponentDrone;
	};

};
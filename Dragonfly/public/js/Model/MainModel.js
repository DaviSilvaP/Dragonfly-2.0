import {Main} from '../Entities/Main.js';

export class MainModel extends Main {
	#dronesData;

	constructor() {
		super();

		this.#dronesData = {};
	};

	// Getters
	get dronesData () {
		return this.#dronesData;
	};

	// Setters
	/*set dronesData (dronesData) {
		this.#dronesData = dronesData;
	};*/

	//Functions
	updateDrone (data, defaultValues) {
		if (data !== undefined) {
			let routeId = data.routeId;
			let droneId = data.droneId;
			let speed = data.speed;
			let height = data.height;

			this.#dronesData[routeId][droneId] = {
				speed: (speed !== undefined) ? speed : defaultValues.speed,
				height: (height !== undefined) ? height : defaultValues.height
			};
		};

	};

	removeDrone (routeId, droneId) {
		if ((droneId in this.#dronesData[routeId]) && (this.#dronesData[routeId].length > 0)) {
			delete this.#dronesData[routeId][droneId];
		};
	};

	removeRoute (routeId) {
		delete this.#dronesData[routeId];
	};

	updateDroneNumberOnPath (routeId, dronesNumber, defaultValues) {

		if (!(routeId in this.dronesData)) {
			this.#dronesData[routeId] = {};
		};

		let Nkeys = Object.keys(this.dronesData[routeId]).length;
		if (dronesNumber > Nkeys) {
			for (let i = Nkeys + 1; i <= dronesNumber; i++) {
				
				let data = {
					routeId: routeId,
					droneId: i,
					speed: defaultValues.speed,
					height: defaultValues.height
				};

				this.updateDrone(data, undefined);
			};
		} else if (dronesNumber < Nkeys) {
			
			while (Nkeys > dronesNumber) {
				this.removeDrone (routeId, Nkeys)
				Nkeys = Object.keys(this.dronesData[routeId]).length;
			};

		};

	};

	mountLog (droneController) {
		let exit = undefined;
		let data = {};
		let finishedDrones = {};
		
		let interval = setInterval(() => {
			let drones = droneController.drones;
			exit = true;

			Object.values(drones).forEach((drone) => {

				if (data[drone.model.id] === undefined) {
					data[drone.model.id] = [];
				};
				
				if (!finishedDrones[drone.model.id]) {
					data[drone.model.id].push({
						speed: drone.model.speed,
						height: drone.model.height,
						battery: drone.model.initialBatteryCapacity,
						env: {
							envId: drone.model.dataEnv.envId,
							windSpeed: drone.model.dataEnv.windSpeed,
							rainForce: drone.model.dataEnv.rainForce
						},
						status: {
							code: drone.model.status.code,
							value: drone.model.dictCode[drone.model.status.code],
							motive: drone.model.status.motive,
						}
					});
				};
				
				let exit_simullation = ( drone.model.badCodes.includes(drone.model.status.code) );
				finishedDrones[drone.model.id] = exit_simullation;
				exit = exit && exit_simullation;
			});

			if (Object.values(drones).length > 0 && exit) {
				let json = JSON.stringify(data);
				console.log(data);
				clearInterval(interval);
			};

		}, 1000);


	};
};
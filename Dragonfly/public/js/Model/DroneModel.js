import {Style, Icon, Circle, Fill, Stroke} from 'ol/style';
import {getLength} from 'ol/sphere';
import {LineString} from 'ol/geom';

import {Drone} from '../Entities/Drone.js';

import drone from '../../data/drone.png';
import colised from '../../data/colised.png';

export class DroneModel extends Drone {
	#environmentObserver;
	#dataEnv;
	#opponentDrone;
	#status;
	#codes;
	#badCodes;
	#dictCode;

	constructor(id, speed, height, environmentObserver) {
		super(id, speed, height);
		this.environmentObserver = environmentObserver;
		this.dataEnv = {
			envId: undefined,
			windSpeed: 0,
			rainForce: 0,
			obstacleHeight: 0
		};
		this.opponentDrone = [];
		this.initialBatteryCapacity = 100; // 100 %

		this.startCodes();

		this.status = { code: this.codes.INITIALIZING, motive: undefined };
	};

	// Getters
	get environmentObserver () {
		return this.#environmentObserver;
	};
	get dataEnv () {
		return this.#dataEnv;
	};
	get opponentDrone () {
		return this.#opponentDrone;
	};
	get status () {
		return this.#status;
	};
	get codes () {
		return this.#codes;
	};
	get badCodes () {
		return this.#badCodes;
	};
	get dictCode () {
		return this.#dictCode;
	};

	// Setters
	set environmentObserver (environmentObserver) {
		this.#environmentObserver = environmentObserver;
	};
	set dataEnv (dataEnv) {
		this.#dataEnv = dataEnv;
	};
	set opponentDrone (opponentDrone) {
		this.#opponentDrone = opponentDrone;
	};
	set status (status) {
		this.#status = status;
	};

	// Functions
	droneStyle () {
		return {
			'geoMarkerAux': new Style({ // Just to remove probleme about don't found drone image
				image: new Icon({
					scale: 0,
					anchor: [0.5, 0.5],
					src: drone
				})
			}),
			'geoMarker': new Style({
				image: new Icon({
					scale: 0,
					anchor: [0.5, 0.5],
					src: drone
				})
			}),
			'colised': new Style({
				image: new Icon({
					scale: 1,
					anchor: [0.5, 0.5],
					src: colised
				})
			})
		}
	};

	formatLength (line) {
		/*
			Usar para calcular a distancia me metros ou 
				kilometros da variavel this.waypointsDistances
		*/

		let length = getLength(line);
		let output;
		if(length > 100) {
			output = (Math.round(length / 1000 * 100) / 100) + ' Km'; // Km
		}else {
			output = (Math.round(length * 100) / 100) + ' m'; // meters
		}
		return output;
	};

	getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	};

	startCodes () {
		this.#codes = {
			RUNNING: 0,
			COLISION: 1,
			LANDING: 2,
			EXIT_SIMULLATION: 3,
			TAKE_OFF: 4,
			INITIALIZING: 5,
			LOSTED_GPS: 6,
			RETURN_TO_HOME: 7
		};

		this.#badCodes = [
			this.codes.COLISION,
			this.codes.LANDING,
			this.codes.EXIT_SIMULLATION
		];

		this.#dictCode = {};
		Object.keys(this.codes).forEach((key) => {
			this.#dictCode[this.codes[key]] = key;
		});

	};

	updateStatus (code, motive) {
		if (this.badCodes.includes(this.status.code)) return;
		this.status = { code: code, motive: motive };
	};

	startEnvironmentObserver () {
		this.environmentObserver.notify({
			type: 'appendDroneEnvs',
			droneId: this.id
		});
	};

	finishEnvironmentObserver () {
		this.environmentObserver.notify({
			type: 'removeDroneEnvs',
			droneId: this.id
		});
	};

	attachPromise (callback, ...args) {
		return new Promise (resolve => {
				callback(resolve, ...args);
			}
		);
	};

	timePerPoint (resolve, speed, dS, windSpeed) {
		// Calcula o tempo que o drone deve levar para passar de um ponto para 
		// outro considerando a velocidade definida para o mesmo em m/s.
		let droneSpeed = speed - windSpeed;
		resolve ((dS / droneSpeed) * 1000);
		
	};

	lostedGPS (dx, dy) {
		let originalCoords = this.coords;

		///////////////////
		// MANDAR PARA AO O FINAL DA EXECUÇÃO
		///////////////////

		// External Interval
		this.lostedGPSInterval = setInterval(() => {

			if (this.status.code !== this.codes.LOSTED_GPS && Math.random() < 0.01) {
				console.log("GPS Perdido");
				
				originalCoords = this.coords;
				this.updateStatus(this.codes.LOSTED_GPS, undefined);

				// Internal Interval
				let intervalI = setInterval(() => {

					// Retorna negativo ou positivo
					let x = 2 * [-1,1][Math.floor(Math.random()*1.99)];
					let y = 2 * [-1,1][Math.floor(Math.random()*1.99)];

					this.coords = this.coords.map((value, i) => value + [x,y][i]);

					if (Math.random() <= 0.3) {
						this.updateStatus(this.codes.RUNNING, undefined);
						// this.coords = originalCoords;
						clearInterval(intervalI);
					};

				},200);

			};

		}, 1000);


	};

	batteryConsumption () {

		const checkBattery = () => {
			console.log("Battery: ", this.initialBatteryCapacity);
			if (this.initialBatteryCapacity <= 0) {
				this.updateStatus(this.codes.LANDING, "Without Battery");
				clearInterval(this.batteryCheckerInterval);
			};
		};

		this.batteryCheckerInterval = setInterval(() => {

			console.log("Battery: ", this.initialBatteryCapacity);

			if (this.status.code === this.codes.RUNNING || 
				this.status.code === this.codes.RETURN_TO_HOME) {

				// Vento mais forte gasta mais batéria
				let normalization = (this.speed - this.dataEnv.windSpeed) / this.speed;
				this.initialBatteryCapacity -= (3 - normalization);

			} else if (this.status.code === this.codes.TAKE_OFF) {
				console.log("TAKE_OFF");
				this.initialBatteryCapacity -= 1;
			} else if (this.status.code === this.codes.LANDING) {
				console.log("LANDING");
				this.initialBatteryCapacity -= 1;
			} else {
				console.log("Default");
				this.initialBatteryCapacity -= 0;
			};

			checkBattery();

		}, 1000);

	};

	moviment (dSl) {

		let x0 = this.coords[0];
		let y0 = this.coords[1];
		let x1 = this.waypoints[this.lastWaypointIndex + 1][0];
		let y1 = this.waypoints[this.lastWaypointIndex + 1][1];

		let dx = x1 - x0;
		let dy = y1 - y0;

		// coeficiente angular
		let m = dy / dx;
		let teta = Math.atan(m);
		let dx2 = Math.cos(teta) * dSl;
		let dy2 = Math.sin(teta) * dSl;
		if (x0 > x1) {
			dx2 = dx2 * -1;
			dy2 = dy2 * -1;
		};

		return [dx2, dy2];

	};

	returnToHome () {

		return new Promise ((resolve, reject) => {

			(async () => {

				// Espaço de coordenadas para a movimentação do drone
				let dSl = 3.0;
				this.lastWaypointIndex = -1;

				let [dx, dy] = this.moviment(dSl);
				let wps = this.waypoints;
				let lastwpi = this.lastWaypointIndex;

				this.coords = this.coords.map((value, i) => value + [dx,dy][i]);

				let distanceToWaypoint = this.coords.map((value, i) => 
					Math.abs(value) - Math.abs(wps[0][i]))

				// Verifica se está próximo o suficiente do próximo waypoint
				if (Math.abs(distanceToWaypoint[0]) <= 3.0 && 
					Math.abs(distanceToWaypoint[1]) <= 3.0) {
					console.log("Entrou");
					this.updateStatus(this.codes.LANDING, "Finish return to home");
				};

				this.environmentObserver.notify({
					type: 'envInfosByDrone',
					droneId: this.id,
					droneCoords: this.coords,
				});

				let time = await this.attachPromise(this.timePerPoint, this.speed, 
						dSl, this.dataEnv.windSpeed);

				resolve(time);

			})();

		});

	};

	followDronePath () {

		return new Promise ((resolve, reject) => {

			(async () => {

				// Espaço de coordenadas para a movimentação do drone
				let dSl = 3.0;
				let [dx, dy] = this.moviment(dSl);
				let wps = this.waypoints;
				let lastwpi = this.lastWaypointIndex;

				this.coords = this.coords.map((value, i) => value + [dx,dy][i]);

				let distanceToWaypoint = this.coords.map((value, i) => 
					Math.abs(value) - Math.abs(wps[lastwpi + 1][i]))

				// Verifica se está próximo o suficiente do próximo waypoint
				if (Math.abs(distanceToWaypoint[0]) <= 3.0 && 
					Math.abs(distanceToWaypoint[1]) <= 3.0) {
					this.lastWaypointIndex += 1;
				};

				this.environmentObserver.notify({
					type: 'envInfosByDrone',
					droneId: this.id,
					droneCoords: this.coords,
				});

				let time = await this.attachPromise(this.timePerPoint, this.speed, 
						dSl, this.dataEnv.windSpeed);

				resolve(time);

			})();

		});

	};

	advanceWaypoints () {
		return new Promise ((resolve, reject) => {

			(async () => {

				if (this.status.code === this.codes.EXIT_SIMULLATION) {
					reject(this.status);
				};

				if (this.status.code === this.codes.LANDING) {
					reject(this.status);
				};

				if (this.status.code === this.codes.LOSTED_GPS) {
					resolve({
						status: this.status,
						time: 1000
					});
				};

				// Verifica colisão com um possível obstaculo
				if (this.dataEnv.obstacleHeight) {
					if (this.dataEnv.obstacleHeight >= this.height) {
						this.updateStatus(this.codes.COLISION, "Obstacle");
						reject(this.status);
					};
				};

				for (let i in this.opponentDrone) {
					if (this.opponentDrone[i].distance <= 50 && 
						this.opponentDrone[i].height == this.height) {
						this.updateStatus(this.codes.COLISION, "Drone");
						reject(this.status);
					};
				};

				if (this.lastWaypointIndex >= this.waypoints.length - 1) {
					this.updateStatus(this.codes.LANDING, "Mission Complete");
					reject(this.status);
				};

				let time = 0;
				if (this.status.code === this.codes.RETURN_TO_HOME){
					time = await this.returnToHome();
				} else {
					time = await this.followDronePath();
				};

				resolve({
					status: this.status,
					time: time
				});

			})();

		});
	};
};
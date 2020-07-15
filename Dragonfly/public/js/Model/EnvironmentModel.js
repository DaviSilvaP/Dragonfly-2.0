import {Environment} from '../Entities/Environment.js';
import {Wind} from '../Entities/Wind.js';
import {Rain} from '../Entities/Rain.js';
import {Obstacle} from '../Entities/Obstacle.js';

export class EnvironmentModel extends Environment {
	#wind;
	#rain;
	#obstacles;

	constructor(id) {
		super(id);
		this.wind = new Wind(0);
		this.rain = new Rain(0);
		this.obstacles = {};
	};

	// Getters
	get wind () {
		return this.#wind;
	};
	get rain () {
		return this.#rain;
	};
	get obstacles () {
		return this.#obstacles;
	};

	// Setters
	set wind (wind) {
		this.#wind = wind;
	};
	set rain (rain) {
		this.#rain = rain;
	};
	set obstacles (obstacles) {
		this.#obstacles = obstacles;
	};

	// Functions
	addObstacle (obstacleId) {
		this.obstacles[obstacleId] = new Obstacle(0);
	};

	updateAttributes (data) {
		this.wind.speed = data.windSpeed;
		this.rain.force = data.rainForce;
	};

	updateObstacle (data) {
		let obstacleId = data.obstacleId;
		this.obstacles[obstacleId].height = data.obstacleHeight;
	}

	dataForSimulation (obstacleId) {
		return {
			envId: this.id,
			windSpeed: this.wind.speed,
			rainForce: this.rain.force,
			obstacleHeight: obstacleId ? this.obstacles[obstacleId].height : undefined
		};
	};

	getEnvData () {
		return {
			windSpeed: this.wind.speed,
			rainForce: this.rain.force
		};
	};

	getObsData (obstacleId) {
		if (obstacleId in this.obstacles){
			return {
				obstacleHeight: this.obstacles[obstacleId].height
			};
		};
		return false;
	};
};
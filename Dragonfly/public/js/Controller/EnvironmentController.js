import {EnvironmentModel} from '../Model/EnvironmentModel.js';
import {EnvironmentView} from '../View/EnvironmentView.js';

export class EnvironmentController {
	#environments;
	#envObserverActions;
	#lastAccessedEnv;
	#lastAccessedObstacle;

	constructor () {
		if(!!EnvironmentController.instance){
			return EnvironmentController.instance;
		};

		this.lastAccessedEnv = undefined;
		this.lastAccessedObstacle = undefined;
		this.environments = {};
		this.droneToEnv = {};

		/*
			-1 é o ambiente default (toda a área do mapa 
				que não foi selecionada como um ambiente)
		*/
		this.addEnvironment(-1);

		EnvironmentController.instance = this;
		return this;
	};

	// Getters
	get environments () {
		return this.#environments;
	};
	get envObserverActions () {
		return this.#envObserverActions;
	};
	get lastAccessedEnv () {
		return this.#lastAccessedEnv;
	};
	get lastAccessedObstacle () {
		return this.#lastAccessedObstacle;
	};

	// Setters
	set environments (environments) {
		this.#environments = environments;
	};
	set envObserverActions (envObserverActions) {
		this.#envObserverActions = envObserverActions;
	};
	set lastAccessedEnv (lastAccessedEnv) {
		this.#lastAccessedEnv = lastAccessedEnv;
	}
	set lastAccessedObstacle (lastAccessedObstacle) {
		this.#lastAccessedObstacle = lastAccessedObstacle;
	}

	// Functions
	addEnvironment (envId) {
		this.environments[envId] = {
			model: new EnvironmentModel(envId),
			view: new EnvironmentView(),
			drones: []
		};
	};

	removeEnvironment (envId) {
		delete this.environments[envId];
	};

	checkCurrentDroneEnv (droneId) {
		let envId = undefined;
		let index = undefined;
		let keys = Object.keys(this.environments);

		for (index = 0; index < keys.length; index++) {
			let key = keys[index];
			if (this.environments[key].drones.includes(droneId)) {
				envId = parseInt(key);
				break;
			};
		};

		return envId;
	};

	removeDroneFromEnvironment (droneId, envId) {
		if (envId != undefined) {
			let drones = this.environments[envId].drones;
			this.environments[envId].drones = drones.filter((value) => value !== droneId);
		};
	};

	updateEnvObserverActions (mapObserver, droneObserver) {
		this.#envObserverActions = {
			createEnv: (data) => {
				// Chamado em Draw.js ao desenhar um ambiente

				let envId = data.envId;
				let obstacles = data.obstacles;
				this.addEnvironment(envId);

				// Adiciona o obstaculos que estavam na área onde o ambiente foi criado
				obstacles.forEach((obstacle) => {
					let obstacleId = obstacle.getId();
					this.environments[envId].model.addObstacle(obstacleId);
				});
			},
			createObstacle: (data) => {

				// Adicionar data.envId no Draw.js
				let envId = data.envId;
				let obstacleId = data.obstacleId;
				envId = envId === undefined ? -1 : envId;
				this.environments[envId].model.addObstacle(obstacleId);

			},
			removeEnv: (data) => {

				let envId = data.envId;
				this.removeEnvironment(envId);

			},
			appendDroneEnvs: (data) => {
				let droneId = data.droneId;
				// Lembrar de startar zerada a cada nova simulação
				this.droneToEnv[droneId] = {
					envId: undefined,
					droneCoords: undefined,
					colisionData: undefined
				};
			},
			removeDroneEnvs: (data) => {

				let droneId = data.droneId;
				delete this.droneToEnv[droneId];

			},
			updateDronesEnvs: (data) => {
				// updated on MapController

				let droneId = data.droneId;
				this.droneToEnv[droneId].envId = data.envId;
				this.droneToEnv[droneId].droneCoords = data.droneCoords;
				this.droneToEnv[droneId].colisionData = data.colisionData;

			},
			envInfosByDrone: (data) => {
				let droneId = data.droneId;
				let droneCoords = data.droneCoords;
				mapObserver.notify({droneId: droneId, droneCoords: droneCoords, 
									drones: this.droneToEnv});
				
				let lastDroneEnv = this.checkCurrentDroneEnv(droneId);
				let envId = this.droneToEnv[droneId].envId;
				let obstacleID = this.droneToEnv[droneId].colisionData.obstacleID;

				/*
					Situações:
					- Drone sem ambiente (começo de simulação)
					- Drone saindo do ambiente default para um ambiente definido
					- Drone saindo do ambiente definido para um ambiente default
					- Drone mantendo-se no mesmo ambiente
				*/

				// Deve se repetir mais
				if (lastDroneEnv === envId) {
					// Altera apenas informações relacionadas a possiveis colisões (outros drones e
					// obstaculos).
					droneObserver.notify({
						droneId: droneId,
						envData: this.environments[envId].model.dataForSimulation(obstacleID),
						opponentDrone: this.droneToEnv[droneId].colisionData.opponentDrone
					});
				} else if (lastDroneEnv === undefined) {
					// Começo de simulação

					envId = -1;
					this.environments[envId].drones.push(droneId);
					droneObserver.notify({
						droneId: droneId,
						envData: this.environments[envId].model.dataForSimulation(obstacleID),
						opponentDrone: this.droneToEnv[droneId].colisionData.opponentDrone
					});

				} else {
					// Alteração de ambiente

					this.removeDroneFromEnvironment(droneId, lastDroneEnv);
					this.environments[envId].drones.push(droneId);
					droneObserver.notify({
						droneId: droneId,
						envData: this.environments[envId].model.dataForSimulation(obstacleID),
						opponentDrone: this.droneToEnv[droneId].colisionData.opponentDrone
					});
				};
			}
		};
	};

	update (data) {
		let type = data.type;
		let action = this.envObserverActions[type];
		
		if (action) {
			action(data);
		};

	};

	getEnvData (envId) {
		this.lastAccessedEnv = envId;
		return this.environments[envId].model.getEnvData();
	};

	getObsData (obstacleId) {
		let envId = undefined;
		this.lastAccessedObstacle = obstacleId;

		for (envId in this.environments) {
			this.lastAccessedEnv = envId;
			let obstacleData = this.environments[envId].model.getObsData(obstacleId);
			if (obstacleData) { return obstacleData; };
		}
		return undefined;
	};

	updateEMF (button) {
		let envId = this.lastAccessedEnv;
		if(button === 'save'){
			let windSpeed = parseFloat(document.getElementById('windInputEMF').value);
			let rainForce = parseFloat(document.getElementById('rainInputEMF').value);
			
			this.environments[envId].model.updateAttributes({
				windSpeed: windSpeed,
				rainForce: rainForce
			});
		};
		document.getElementById('MainMenuForm').style.display = 'inherit';
		document.getElementById('EnvironmentMenuForm').style.display = 'none';
	};

	updateOMF (button) {
		let envId = this.lastAccessedEnv;
		let obstacleId = this.lastAccessedObstacle;

		if(button === 'save'){
			let obstacleHeight = parseFloat(document.getElementById('obsHeightInputOMF').value);
			
			this.environments[envId].model.updateObstacle({
				obstacleId: obstacleId,
				obstacleHeight: obstacleHeight
			});
		};
		document.getElementById('MainMenuForm').style.display = 'inherit';
		document.getElementById('ObstacleMenuForm').style.display = 'none';
	};

};
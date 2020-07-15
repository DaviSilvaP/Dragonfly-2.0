import {Observable} from '../Observable.js';
import {MainView} from '../View/MainView.js';
import {MainModel} from '../Model/MainModel.js';

export class MainController {
	#mapController;
	#droneController;
	#environmentController;

	#environmentObserver;
	#droneObserver;

	constructor () {
		if(!!MainController.instance){
			return MainController.instance;
		}

		const MapController = require('./MapController.js').MapController;
		const DroneController = require('./DroneController.js').DroneController;
		const EnvironmentController = require('./EnvironmentController.js').EnvironmentController;

		this.mainView = new MainView();
		this.mainModel = new MainModel();
		this.environmentObserver = new Observable();
		this.droneObserver = new Observable();
		this.mapObserver = new Observable();

		this.mapController = new MapController(this.environmentObserver);
		this.droneController = new DroneController();
		this.environmentController = new EnvironmentController();

		this.environmentObserver.subscribe(this.environmentController);
		this.droneObserver.subscribe(this.droneController);
		this.mapObserver.subscribe(this.mapController);

		this.environmentController.updateEnvObserverActions(this.mapObserver, this.droneObserver);

		MainController.instance = this;
		return this;
	};

	// Getters
	get mapController () {
		return this.#mapController;
	};
	get droneController() {
		return this.#droneController;
	};
	get environmentController() {
		return this.#environmentController;
	};
	get environmentObserver() {
		return this.#environmentObserver;
	};
	get droneObserver() {
		return this.#droneObserver;
	};


	//Setters
	set mapController (mapController) {
		this.#mapController = mapController;
	};
	set droneController (droneController) {
		this.#droneController = droneController;
	};
	set environmentController (environmentController) {
		this.#environmentController = environmentController;
	};
	set environmentObserver (environmentObserver) {
		this.#environmentObserver = environmentObserver;
	};
	set droneObserver (droneObserver) {
		this.#droneObserver = droneObserver;
	};

	// Functions
	updateSize () {
		this.mapController.updateSize();
	};

	geolocationSearch () {
		this.mapController.geolocationSearch();
	};

	searchAddress (key, address) {
		this.mapController.searchAddress(key, address);
	};

	drawOnClick (type) {
		this.mapController.drawOnClick(type, this.environmentObserver);
	};

	removeDrawedElement () {
		this.mapController.removeDrawedElement(this.environmentObserver);
	};

	selectFeature () {
		this.mapController.selectFeature().then((data) => {
			let featureId = data.featureId;
			let geometryName = data.geometryName;

			if (geometryName === 'Environment') {

				let envData = this.environmentController.getEnvData(featureId);
				this.mainView.showEnvInfos(featureId, envData);

			}else if (geometryName === 'Obstacle') {

				let obstacleData = this.environmentController.getObsData(featureId);
				this.mainView.showObsInfos(featureId, obstacleData);

			}else if (geometryName === 'LineString') {

				this.mainView.showDroneInfos(featureId);

			}else if (geometryName === 'Drone') {

				console.log("Drone pego");
				this.mainView.checkedDroneId = featureId;
				this.mainView.updateDronePanel(this.droneController, featureId);

			};
		});
	};

	updateEMF (button) {
		this.environmentController.updateEMF(button);
	};

	updateOMF (button) {
		this.environmentController.updateOMF(button);
	};

	updateDMF (button) {
		let data = this.mainView.updateDMF(button);
		this.mainModel.updateDrone(data, this.droneController.droneDefaultData);
	};

	updateDroneNumberOnPath (number) {
		let routeId = this.mainView.updateDroneNumberOnPath(number);
		this.mainModel.updateDroneNumberOnPath(routeId, number, this.droneController.droneDefaultData);
	};

	selectDrone () {
		this.mainView.selectDrone(this.mainModel.dronesData);
	};

	startDroneSimulation () {
		let mapData = this.mapController.getMapDataForDrones();

		this.mainModel.mountLog(this.droneController);
		this.droneController.startDroneSimulation(
			mapData, this.environmentObserver, this.mainModel.dronesData
		);
	};
};

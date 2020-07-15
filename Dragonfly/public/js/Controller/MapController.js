export class MapController {
	#mapModel;
	#mapView;
	
	constructor(environmentObserver) {
		if(!!MapController.instance) {
			return MapController.instance;
		}

		MapController.instance = this;

		const MapModel = require('../Model/MapModel.js').MapModel;
		const MapView = require('../View/MapView.js').MapView;

		this.mapModel = new MapModel();
		this.mapView = new MapView(this.mapModel);

		this.environmentObserver = environmentObserver;

		return this;
	};

	// Getters
	get mapModel() {
		return this.#mapModel;
	};
	get mapView() {
		return this.#mapView;
	};

	// Setters
	set mapModel(mapModel) {
		this.#mapModel = mapModel;
	};
	set mapView(mapView) {
		this.#mapView = mapView;
	};

	// Functions
	updateSize () {
		this.mapView.updateSize(this.mapModel.map);
	};

	geolocationSearch () {
		let geolocation = this.mapModel.geolocation;
		let map = this.mapModel.map;
		let view = this.mapModel.view;
		this.mapView.geolocationSearch(geolocation, map, view);
	};

	searchAddress (key, address) {
		let map = this.mapModel.map;
		this.mapView.searchAddress(key, map, address);
	};

	drawOnClick (type, envObservable) {
		let drawParameters = this.mapModel.drawParameters();
		this.mapView.drawOnClick(type, drawParameters, envObservable);
	};

	removeDrawedElement (envObservable) {
		this.mapView.removeDrawedElement(this.mapModel.map, this.mapModel.draw, 
			this.mapModel.source, envObservable);
	};

	selectFeature () {
		return new Promise ((resolve, reject) => {
			this.mapView.selectFeature(this.mapModel.map, this.mapModel.draw)
				.then((data) => {
					resolve(data);
				});
		});
	};

	getMapDataForDrones () {
		this.mapModel.getMapDataForDrones();
		return this.mapModel.mapData;
	};

	update (data) {
		let droneId = data.droneId;
		let droneCoords = data.droneCoords;
		let drones = data.drones;

		let pixel = this.mapModel.map.getPixelFromCoordinate(droneCoords);
		let features = this.mapModel.map.getFeaturesAtPixel(pixel);

		let env = features.filter(function (feature) {
			return feature.getGeometryName() === 'Environment';
		});

		let obstacles = features.filter(function (feature) {
			return feature.getGeometryName() === 'Obstacle';
		});

		// Modificar a detecção de colisão posteriormente para aplicar como uso de sensores
		let envId = env.length ? env[0].getId() : undefined;
		envId = (envId === undefined) ? -1 : parseInt(envId);

		// Nova Aplicação
		let colisionData = {
			obstacleID: obstacles.length ? obstacles[0].getId() : undefined,
			opponentDrone: []
		};

		for (id in drones) {
			if (id != droneId && drones[id].envId == envId) {
				let length = this.mapModel.routeLength([drones[id].droneCoords, droneCoords]);
				colisionData.opponentDrone.push({droneId: id, distance: length});
			};
		};

		///////////////////////////////////////////////////////////

		this.environmentObserver.notify({
			type: 'updateDronesEnvs',
			droneId: droneId,
			droneCoords: droneCoords,
			envId: envId,
			colisionData: colisionData
		});
	};

};
import {LineString, Point} from 'ol/geom';
import Feature from 'ol/Feature';
import {getVectorContext} from 'ol/render';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import {getLength} from 'ol/sphere';

export class DroneAnimation {

	#sourceAnimation;
	#vectorAnimation;
	#geoMarker;

	constructor() {
		this.vectorAnimation = undefined;
		this.sourceAnimation = undefined;
	}

	// Getters
	get sourceAnimation() {
		return this.#sourceAnimation;
	};
	get vectorAnimation() {
		return this.#vectorAnimation;
	};
	get geoMarker() {
		return this.#geoMarker;
	};

	// Setters
	set sourceAnimation(sourceAnimation) {
		this.#sourceAnimation = sourceAnimation;
	};
	set vectorAnimation(vectorAnimation) {
		this.#vectorAnimation = vectorAnimation;
	};
	set geoMarker(geoMarker) {
		this.#geoMarker = geoMarker;
	};

	takeoff (drone, p) {
		setTimeout(() => {

			this.geoMarker.getStyle().getImage().setScale(1*p);
			// Atualiza o drone
			this.geoMarker.getGeometry().setCoordinates(drone.model.coords);
			p += 0.02;

			if (p > 1.0) {
				drone.model.startEnvironmentObserver();
				this.droneMoviment(drone, 2000);
			} else {
				this.takeoff (drone, p);
			};

		}, 100);
	};

	landing (drone, p) {
		setTimeout(() => {

			this.geoMarker.getStyle().getImage().setScale(1*p);
			// Atualiza o drone
			this.geoMarker.getGeometry().setCoordinates(drone.model.coords);
			p -= 0.02;

			if (p >= 0.0) {
				this.landing(drone, p);
			};

		}, 100);
	};

	colision (drone) {
		this.geoMarker.setStyle(drone.model.droneStyle()['colised']);
		this.geoMarker.getGeometry().setCoordinates(drone.model.coords);
	};

	// Functions
	droneMoviment (drone, timeToStart) {

		const codes = drone.model.codes;
		drone.model.updateStatus(drone.model.codes.RUNNING, undefined);
		drone.model.lostedGPS();

		const move = (ms) => {
			setTimeout(() => {

				drone.model.advanceWaypoints().then(({status, time}) => {
					this.geoMarker.getGeometry().setCoordinates(drone.model.coords);
					move(time);
				})
				.catch((status) => {
					drone.model.finishEnvironmentObserver();
					clearInterval(drone.model.batteryCheckerInterval);
					clearInterval(drone.model.lostedGPSInterval);
					switch (status.code) {
						case codes.LANDING:
							this.landing(drone, 1.0);
							break;
						case codes.COLISION:
							this.colision(drone);
							break;
						case codes.EXIT_SIMULLATION:
							break
						default:
							break;
					};
				});

			}, ms);
		};

		move(timeToStart);

	};

	startDroneSimulation (mapData, drone) {

		let map = mapData.map;
		let draw = mapData.draw;
		let source = mapData.source;
		let waypoints = drone.model.waypoints;

		drone.model.lastWaypointIndex = 0;
		drone.model.coords = drone.model.waypoints[0];

		this.sourceAnimation = new VectorSource();
		this.vectorAnimation = new VectorLayer();
		this.vectorAnimation.setSource(this.sourceAnimation);
		map.addLayer(this.vectorAnimation);

		this.animating = true;
		this.geoMarker = new Feature({type: 'geoMarker'});
		this.geoMarkerAux = new Feature({type: 'geoMarkerAux'});

		this.geoMarker.setStyle(drone.model.droneStyle()['geoMarker']);
		this.geoMarkerAux.setStyle(drone.model.droneStyle()['geoMarkerAux']);

		this.geoMarker.setId(drone.model.id);
		this.geoMarker.setGeometryName('Drone');
		this.geoMarker.setGeometry(new Point(waypoints[0]));
		this.geoMarkerAux.setGeometry(new Point(waypoints[waypoints.length - 1]));

		this.sourceAnimation.addFeatures([this.geoMarker, this.geoMarkerAux]);

		map.removeInteraction(draw['draw']);
		map.removeInteraction(draw['snap']);
		map.removeInteraction(draw['select']);
		map.removeInteraction(draw['modify']);
		map.removeInteraction(draw['info']);

		// Inicializa a animação
		drone.model.updateStatus(drone.model.codes.TAKE_OFF, undefined);
		drone.model.batteryConsumption();
		// drone.model.lostedGPS();
		this.takeoff(drone, 0.0);
	};

};
import {Select, Draw as Draw, DoubleClickZoom} from 'ol/interaction';
import {LineString, Point} from 'ol/geom';
import {Style, Stroke, Fill, Circle, Icon} from 'ol/style';
import Feature from 'ol/Feature';

import startIcon from '../../../data/startIcon.png';
import endIcon from '../../../data/endIcon.png';

export class DrawInterations {
	#lastFeatureId;

	constructor() { this.#lastFeatureId = 0; };

	// Getters
	get lastFeatureId () {
		return this.#lastFeatureId;
	};

	// Setters
	set lastFeatureId (lastFeatureId) {
		this.#lastFeatureId = lastFeatureId;
	};

	// Functions
	defineElementStyle (type) {
		let color = '#0088ff';
		if (type == 'LineString') {
			color = color;
		}else if (type == 'Environment') {
			color = 'green';
		}else if (type == 'Obstacle') {
			color = 'gray';
		}

		return new Style({
			stroke: new Stroke({
				color: color,
				width: 3
			}),
			fill: new Fill({
				color: 'rgba(255,255,255,0.2)'
			}),
			image: new Circle({
				radius: 7,
				fill: new Fill({
					color: '#0088ff'
				})
			})
		});
	};

	insertStartEndMarkers (source, feature, vectorLayer) {
		let styles = {
			'startIcon': new Style({
				image: new Icon({
					anchor: [0.5, 1],
					src: startIcon
				})
			}),
			'endIcon': new Style({
				image: new Icon({
					color: 'green',
					anchor: [0.5, 1],
					src: endIcon
				})
			}),
		};

		let route = feature.getGeometry().getCoordinates();
		let startMarker = new Feature({type: 'startIcon'});
		let endMarker = new Feature({type: 'endIcon'});

		startMarker.setId("startMarker_" + feature.getId());
		endMarker.setId("endMarker_" + feature.getId());

		startMarker.setGeometry(new Point(route[0]));
		endMarker.setGeometry(new Point(route[route.length - 1]));

		source.addFeatures([startMarker, endMarker]);
		
		vectorLayer.setStyle(function(feature) {
			return styles[feature.get('type')];
		});
	}

	drawOnClick (type, mapData, envObservable) {
		if(type !== 'None'){
			this.addInteractions(type, mapData, envObservable);
		} else {
			let map = mapData.map;
			let draw = mapData.draw;

			map.removeInteraction(draw['snap']);
			map.removeInteraction(draw['draw']);
			map.removeInteraction(draw['select']);
			map.removeInteraction(draw['info']);
			map.removeInteraction(draw['modify']);

			map.addInteraction(draw['modify']);			
			map.addInteraction(draw['snap']);
		};
	};
	
	removeDrawedElement (map, draw, source, envObservable) {
		map.removeInteraction(draw['draw']);
		map.removeInteraction(draw['snap']);
		map.removeInteraction(draw['select']);
		map.removeInteraction(draw['modify']);
		map.removeInteraction(draw['info']);

		draw['select'] = new Select();
		map.addInteraction(draw['select']);

		draw['select'].on('select', function(e) {
			let feature = e.target.getFeatures().item(0);
			let featureId = feature.getId();

			if (feature.getGeometryName() == "LineString") {
				let startMarker = source.getFeatureById("startMarker_" + featureId);
				let endMarker = source.getFeatureById("endMarker_" + featureId);
				source.removeFeature(startMarker);
				source.removeFeature(endMarker);
			};

			envObservable.notify({source:'draw', type: 'removeEnv', envId: featureId });
			source.removeFeature(feature);

			map.addInteraction(draw['modify']);
			map.removeInteraction(draw['select']);
		});
	};

	startDraw (event, variablesForEvents) {

		let featureId = variablesForEvents.featureId;
		let type = variablesForEvents.type;
		let feature = event.feature;

		feature.setId(featureId);

		if(type === 'LineString'){
			let listener = feature.getGeometry().on('change', function(e) {
				let geom = e.target;
				let output;
				/*if(geom instanceof LineString) {
					output = formatLength(geom);
				}*/
			});
		};

	};

	endDraw (event, variablesForEvents) {

		let map = variablesForEvents.mapData.map;
		let source = variablesForEvents.mapData.source;
		let vectorLayer = variablesForEvents.mapData.vector;

		let featureId = variablesForEvents.featureId;
		let typePolygon = variablesForEvents.typePolygon;
		let envObservable = variablesForEvents.envObservable;

		let feature = event.feature;
		let envId = undefined;
		let obstacleId = undefined;
		let droneId = undefined;

		feature.setStyle(this.defineElementStyle(typePolygon));

		if(typePolygon === "Environment"){
			let features = source.getFeatures();

			let obstacles = features.filter((featureFromMap) => {
				let geometry = featureFromMap.getGeometry();
				let geometryName = featureFromMap.getGeometryName();

				if (geometryName === 'Obstacle' && 
					feature.getGeometry().intersectsExtent(geometry.getExtent())) {
					return true
				} else {
					return false;
				};
			});

			let envs = features.filter((featureFromMap) => {
				let geometry = featureFromMap.getGeometry();
				let geometryName = featureFromMap.getGeometryName();

				if (geometryName === 'Environment' && 
					featureFromMap.getId() != featureId && 
					feature.getGeometry().intersectsExtent(geometry.getExtent())) {
					return true
				} else {
					return false;
				};
			});

			if (envs.length > 0) {
				feature.setGeometryName("toRemove");
			} else {
				envObservable.notify({
					source:'draw', type: 'createEnv', envId: featureId, obstacles: obstacles
				});
			};

		}else if(typePolygon === "Obstacle") {
			let features = source.getFeatures();

			let envs = features.filter((featureFromMap) => {
				let geometry = featureFromMap.getGeometry();
				let geometryName = featureFromMap.getGeometryName();

				if (geometryName === 'Environment' && 
					feature.getGeometry().intersectsExtent(geometry.getExtent())) {
					return true
				} else {
					return false;
				};
			});

			if (envs.length) {
				envId = envs[0].getId();
			};

			envObservable.notify({
				source:'draw', type: 'createObstacle', 
				envId: envId, obstacleId: featureId });

		}else if(typePolygon === "LineString") {

			this.insertStartEndMarkers(source, feature, vectorLayer);

		};

		return feature;

	};
	
	addInteractions (type, mapData, envObservable) {

		let map = mapData.map;
		let draw = mapData.draw;

		map.removeInteraction(draw['snap']);
		map.removeInteraction(draw['draw']);
		map.removeInteraction(draw['select']);
		map.removeInteraction(draw['modify']);
		map.removeInteraction(draw['info']);

		let source = mapData.source;

		let featureId = this.lastFeatureId;
		this.lastFeatureId += 1;
		
		let typePolygon = type;

		if(type === "Obstacle" || type === "Environment"){
			type = 'Polygon';
		};

		/* Interação para desenhar traços geometricos */
		draw['draw'] = new Draw({
			source: source,
			type: type,
			geometryName: typePolygon
		});

		map.addInteraction(draw['snap']);
		map.addInteraction(draw['draw']);

		let variablesForEvents = {
			featureId: featureId,
			type: type,
			typePolygon: typePolygon,
			envObservable: envObservable,
			mapData: mapData
		};

		let instance = this;
		draw['draw'].on('drawstart', (event) => { instance.startDraw (event, variablesForEvents); });

		let drawing = () => {
			return new Promise ((resolve, reject) => {
				draw['draw'].on('drawend', (event) => {
					resolve(instance.endDraw(event, variablesForEvents));
				});
			});
		};

		drawing().then((feature) => {
			// Caso a feature seja invalida
			if (feature.getGeometryName() === "toRemove") {
				source.removeFeature(feature);
			};
			this.addInteractions(typePolygon, mapData, envObservable);
		});

	};
};
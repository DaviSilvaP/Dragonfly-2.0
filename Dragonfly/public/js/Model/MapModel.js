import {getLength} from 'ol/sphere';
import {LineString} from 'ol/geom';

import {MapI} from '../Entities/Map.js';

export class MapModel extends MapI {
	#mapData;

	constructor(envData) {
		super();
		this.mapData = {
			map: this.map,
			draw: this.draw,
			source: this.source,
			waypoints: undefined,
			waypointsDistances: undefined
		};
	};

	// Getters
	get mapData () {
		return this.#mapData;
	};

	// Setters
	set mapData (mapData) {
		this.#mapData = mapData;
	};

	// Functions
	routeLength (waypoints) {
		let line = new LineString(waypoints);
		return Math.round(getLength(line) * 100) / 100;
	};

	formatLength (line) {
		let length = getLength(line);
		let output;
		if(length > 100) {
			output = (Math.round(length / 1000 * 100) / 100) + ' Km'; // Km
		}else {
			output = (Math.round(length * 100) / 100) + ' m'; // meters
		}
		return output;
	};

	// Return for functions with a lot of parameters
	drawParameters () {
		return {
			map: this.map,
			draw: this.draw,
			source: this.source,
			vector: this.vector
		};
	};

	getMapDataForDrones () {
		let lineStrings = this.source.getFeatures().filter((feature, index) => {
			return feature.getGeometryName() === "LineString";
		});

		console.log(lineStrings[0].getGeometry().getCoordinates());

		let waypoints = {};
		let waypointsDistances = [];

		lineStrings.forEach((lineString, i) => {
			let id = lineString.getId();
			waypoints[id] = lineString.getGeometry().getCoordinates();
			// waypoints.push(lineString.getGeometry().getCoordinates());
			waypointsDistances.push([]);

			for (let j = 0; j < waypoints[id][i].length - 1; j++) {
				waypointsDistances[i].push(this.routeLength(waypoints[id][i].slice(j,j+2)));
			};
		});

		this.mapData.waypoints = waypoints;
		this.mapData.waypointsDistances = waypointsDistances;
		this.mapData.map = this.map;
		this.mapData.draw = this.draw;
		this.mapData.source = this.source;	

	};

};
import {Feature} from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Point} from 'ol/geom';
import {applyTransform} from 'ol/extent';
import {getTransform} from 'ol/proj';

const http = require('http');

export class FindOnMap {
	constructor() {
		this.test = 1;
	}

	// Functions for buttons
	geolocationSearch (geolocation, map, view) {
		var position = geolocation.getPosition();
		var point = new VectorLayer({
			source: new VectorSource({
				features: [
					new Feature({
						geometry: new Point(position)
					})
				]
			})
		});

		console.log("Test = ", this.test);

		map.addLayer(point);
		view.setCenter(position);
		view.setResolution(2.388657133911758);
		return false;
	};

	searchAddress (key, map, endereco) {
		if(key != 13){return};

		console.log(endereco);

		if(endereco) {
			http.get('http://nominatim.openstreetmap.org/search/' + endereco + 
								'?format=json', (resp) => {
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				data = JSON.parse(data);
				console.log(data);
				data = data[0];

				var bbox = data.boundingbox;
				var order = [parseFloat(bbox[2]), parseFloat(bbox[0]), 
								parseFloat(bbox[3]), parseFloat(bbox[1])];
				var extent = applyTransform(order, getTransform('EPSG:4326', 'EPSG:3857'));
				map.getView().fit(extent, map.getSize());
			});

			}).on("error", (err) => {
				console.log("Error: " + err.message);
			});
		};
	};
};
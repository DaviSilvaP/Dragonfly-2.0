import {Map as MapOl, View, Feature, Geolocation} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {ScaleLine, ZoomSlider, defaults as defaultControls} from 'ol/control';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Modify, Select, Snap} from 'ol/interaction';
import {Style, Stroke, Fill, Circle} from 'ol/style';
// Ctrl + Shift + c

import {FindOnMap} from './ToolsForMap/FindOnMap.js';
import {DrawInterations as Draw} from './ToolsForMap/Draw.js';
import {DroneAnimation} from './ToolsForMap/DroneAnimation.js';

export class MapView {
	#findOnMap;
	#draw;
	#droneAnimation;

	constructor(mapModel, envObservable, droneObservable) {

		this.findOnMap = new FindOnMap();
		this.draw = new Draw(envObservable, droneObservable);
		this.droneAnimation = new DroneAnimation();

		mapModel.view = new View({
			center: [-6217890.205764902, -1910870.6048274133],
			zoom: 4,
			maxZoom: 18,
			minZoom: 2
		});

		mapModel.raster = new TileLayer({
			source: new OSM({layer: 'osm'}),
			visible: true,
			name: 'osm'
		});

		mapModel.source = new VectorSource();

		mapModel.vector = new VectorLayer({
			source: mapModel.source
		});

		mapModel.map = new MapOl({
			target: 'map',
			controls: defaultControls().extend([
				new ScaleLine(),
				new ZoomSlider()
			]),
			renderer: 'canvas',
			layers: [mapModel.raster, mapModel.vector],
			view: mapModel.view
		});

		mapModel.geolocation = new Geolocation({
			projection: mapModel.view.getProjection(),
			tracking: true
		});

		mapModel.draw = {
			'draw': undefined,
			'snap': new Snap({source: mapModel.source}),
			'modify': new Modify({source: mapModel.source}),
			'select': new Select(),
			'info': new Select()
		};

		/* Snap: Evita que os traços geomtricos quebrem enquanto modificados.
			Modifica as propriedade dos eventos de coordenada e pixel 
			do browser para forçar qualquer interação. */

		/* Adiciona uma interação ao mapa. */
		mapModel.map.addInteraction(mapModel.draw['modify']);
	};

	// Getters
	get findOnMap() {
		return this.#findOnMap;
	};
	get draw() {
		return this.#draw;
	};
	get droneAnimation() {
		return this.#droneAnimation;
	};

	// Setters
	set findOnMap(findOnMap) {
		this.#findOnMap = findOnMap;
	};
	set draw(draw) {
		this.#draw = draw;
	};
	set droneAnimation(droneAnimation) {
		this.#droneAnimation = droneAnimation;
	};

	// Functions for buttons
	geolocationSearch (geolocation, map, view) {
		this.findOnMap.geolocationSearch(geolocation, map, view);
	};

	searchAddress (key, map, endereco) {
		this.findOnMap.searchAddress(key, map, endereco);
	};

	drawOnClick (type, drawParameters, envObservable) {
		this.draw.drawOnClick(type, drawParameters, envObservable);
	};

	removeDrawedElement (map, draw, source, envObservable) {
		this.draw.removeDrawedElement(map, draw, source, envObservable);
	};

	selectFeature (map, draw) {
		return new Promise ((resolve, reject) => {

			let featureId = undefined;

			map.removeInteraction(draw['draw']);
			map.removeInteraction(draw['snap']);
			map.removeInteraction(draw['select']);
			map.removeInteraction(draw['modify']);
			map.removeInteraction(draw['info']);

			draw['info'] = new Select();
			map.addInteraction(draw['info']);

			draw['info'].on('select', function(e) {
				let feature = e.target.getFeatures().item(0);
				
				featureId = feature.getId();

				map.removeInteraction(draw['info']);
				map.addInteraction(draw['modify']);
				
				resolve({
					featureId: featureId,
					geometryName: feature.getGeometryName()
				});
				
			});

		});
	};

	// Style Functions
	/* Features estão ligadas a informações geometricas.
	Normalmente, uma feature tem uma unica propriedade geometrica.
	Pode-se colocar uma geometrica usando set ou pegar sua geometrica 
	usando o getGeometry.
	É possivel armazenar mais de uma geometria em uma feature usando 
	propriedadesde atributo. */
	
	styleFunction (feature) {
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
			})
		};
		return styles;
	};

	updateSize (map) {
		$('#menu').toggleClass('col-3 col-1');
		$('#mapDiv').toggleClass('col-9 col-11');
		$('.text-center').toggleClass('show');
		$('form').toggleClass('show');

		$('.slide i').toggleClass('fas fa-angle-double-right fas fa-angle-double-left');

		var timeP = 0;
		var id = setInterval(frame, 5);

		function frame() {
			if(timeP == 750){
				map.updateSize();
				clearInterval(id);
			}else {
				timeP += 5;
				map.updateSize();
			}
		}
	};

};
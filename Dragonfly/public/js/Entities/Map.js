export class MapI {
	#map;
	#view;
	#raster;
	#source;
	#vector;
	#geolocation;
	#draw;

	constructor() {};

	// Getters
	get map() {
		return this.#map;
	};
	get view() {
		return this.#view;
	};
	get raster() {
		return this.#raster;
	};
	get source() {
		return this.#source;
	};
	get vector() {
		return this.#vector;
	};
	get geolocation() {
		return this.#geolocation;
	};
	get draw() {
		return this.#draw;
	};

	// Setters
	set map(map) {
		this.#map = map;
	};
	set view(view) {
		this.#view = view;
	};
	set raster(raster) {
		this.#raster = raster;
	};
	set source(source) {
		this.#source = source;
	};
	set vector(vector) {
		this.#vector = vector;
	};
	set geolocation(geolocation) {
		this.#geolocation = geolocation;
	};
	set draw(draw) {
		this.#draw = draw;
	};

};
export class Environment {
	#id;
	#selectedFeature;

	constructor (id) {
		this.id = id;
	};

	// Getters
	get id () {
		return this.#id;
	};
	get selectedFeature () {
		return this.#selectedFeature;
	};

	// Setters
	set id (id) {
		this.#id = id;
	};
	set selectedFeature (selectedFeature) {
		this.#selectedFeature = selectedFeature;
	};
};
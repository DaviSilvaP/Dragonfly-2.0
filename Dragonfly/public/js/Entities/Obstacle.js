export class Obstacle {
	#height;

	constructor (height) {
		this.height = height;
	};

	// Getters
	get height () {
		return this.#height;
	};

	//Setters
	set height (height) {
		this.#height = height;
	};

};
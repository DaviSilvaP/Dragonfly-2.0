export class Wind {
	#speed;

	constructor (speed) {
		this.#speed = speed;
	};

	// Getters
	get speed () {
		return this.#speed
	};

	// Setters
	set speed (speed) {
		this.#speed = speed;
	};
};
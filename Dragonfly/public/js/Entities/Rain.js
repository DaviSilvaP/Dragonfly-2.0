export class Rain {
	#force;

	constructor (force) {
		this.#force = force;
	}

	// Getters
	get force () {
		return this.#force;
	};

	//Setters
	set force (force) {
		this.#force = force;
	};

};
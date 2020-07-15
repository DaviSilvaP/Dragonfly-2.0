export class Observable {
	#observers;

	constructor() {
		this.observers = [];
	};

	// Getters
	get observers(){
		return this.#observers;
	};

	// Setters
	set observers(observers) {
		this.#observers = observers;
	};

	// Functions
	subscribe (observer) {
		this.observers.push(observer);	
	};

	unsubscribe (observerRemove) {
		this.observers = this.observers.filter(
			(observer) => {return observer !== observerRemove;});
	};

	notify (data) {
		this.observers.forEach((el) => el.update(data));
	};
};
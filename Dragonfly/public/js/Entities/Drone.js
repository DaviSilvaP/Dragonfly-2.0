export class Drone {
	#id;
	#ang;
	#speed;
	#maxSpeed;
	#height;
	#initialBatteryCapacity;
	#currentBatteryCapacity;
	#weight;
	#discharge;
	#voltage;

	#coords;
	#waypoints;
	#lastWaypointIndex;

	constructor (id, speed, height) {
		this.id = id;
		this.speed = speed;
		this.height = height;
		this.lastWaypointIndex = undefined;
	};

	// Getters
	get id() {
		return this.#id;
	};
	get ang() {
		return this.#ang;
	};
	get speed() {
		return this.#speed;
	};
	get maxSpeed() {
		return this.#maxSpeed;
	};
	get height() {
		return this.#height;
	};
	get initialBatteryCapacity() {
		return this.#initialBatteryCapacity;
	};
	get currentBatteryCapacity() {
		return this.#currentBatteryCapacity;
	};
	get weight() {
		return this.#weight;
	};
	get discharge() {
		return this.#discharge;
	};
	get voltage() {
		return this.#voltage;
	};
	get coords() {
		return this.#coords;
	};
	get waypoints () {
		return this.#waypoints;
	};
	get lastWaypointIndex () {
		return this.#lastWaypointIndex;
	};

	// Setters
	set id(id) {
		this.#id = id;
	};
	set ang(ang) {
		this.#ang = ang;
	};
	set speed(speed) {
		this.#speed = speed;
	};
	set maxSpeed(maxSpeed) {
		this.#maxSpeed = maxSpeed;
	};
	set height(height) {
		this.#height = height;
	};
	set initialBatteryCapacity(initialBatteryCapacity) {
		this.#initialBatteryCapacity = initialBatteryCapacity;
	};
	set currentBatteryCapacity(currentBatteryCapacity) {
		this.#currentBatteryCapacity = currentBatteryCapacity;
	};
	set weight(weight) {
		this.#weight = weight;
	};
	set discharge(discharge) {
		this.#discharge = discharge;
	};
	set voltage(voltage) {
		this.#voltage = voltage;
	};
	set coords(coords) {
		this.#coords = coords;
	};
	set waypoints(waypoints) {
		this.#waypoints = waypoints;
	};
	set lastWaypointIndex (lastWaypointIndex) {
		this.#lastWaypointIndex = lastWaypointIndex;
	};
};
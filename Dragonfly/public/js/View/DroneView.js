import {DroneAnimation} from './ToolsForMap/DroneAnimation.js';

export class DroneView {
	#droneAnimation;

	constructor() {
		this.droneAnimation = new DroneAnimation();
	};

	// Getters
	get droneAnimation() {
		return this.#droneAnimation;
	};

	// Setters
	set droneAnimation(droneAnimation) {
		this.#droneAnimation = droneAnimation;
	};

	// other functions
	startDroneSimulation (mapData, drone) {
		this.droneAnimation.startDroneSimulation(mapData, drone);
	};
};
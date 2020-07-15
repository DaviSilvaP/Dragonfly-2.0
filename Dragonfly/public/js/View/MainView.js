const echarts = require("echarts");

export class MainView {
	#graphInterval;
	#checkedDroneId;

	constructor() {
		this.#graphInterval = undefined;
		this.#checkedDroneId = undefined;
	};

	// Getters
	get graphInterval () {
		return this.#graphInterval;
	};
	get checkedDroneId () {
		return this.#checkedDroneId;
	};

	// Setters
	set graphInterval (graphInterval) {
		this.#graphInterval = graphInterval;
	};
	set checkedDroneId (checkedDroneId) {
		this.#checkedDroneId = checkedDroneId;
	};

	// Funtions
	showEnvInfos (featureId, data) {
		let speedWind = data.windSpeed;
		let rainForce = data.rainForce;

		document.getElementById('MainMenuForm').style.display = 'none';
		document.getElementById('EnvironmentMenuForm').style.display = 'inherit';
		document.getElementById('envInputEMF').value = 'Environment: ' + featureId;
		document.getElementById('windInputEMF').value = speedWind;
		document.getElementById('rainInputEMF').value = rainForce;
	};

	showObsInfos (featureId, data) {
		// Obstacle
		let obstacleHeight = data.obstacleHeight;

		document.getElementById('MainMenuForm').style.display = 'none';
		document.getElementById('ObstacleMenuForm').style.display = 'inherit';
		document.getElementById('obsInputOMF').value = 'Obstacle: ' + featureId;
		document.getElementById('obsHeightInputOMF').value = obstacleHeight;
	};

	showDroneInfos (featureId) {
		// Drone

		document.getElementById('MainMenuForm').style.display = 'none';
		document.getElementById('DroneMenuForm').style.display = 'inherit';
		document.getElementById('routeIDDrones').value = 'Route ID: ' + featureId;
	};

	updateDroneNumberOnPath (number) {
		let selector = document.getElementById('droneSelector');

		while (selector.children.length > 0) {
			selector.removeChild(selector.lastChild);
		};

		let selectDrone = this.selectDrone;

		for (let i = 1; i <= number; i++) {
			let option = document.createElement("option");
			option.className = 'droneOption';
			option.textContent = 'Drone ' + i;

			selector.appendChild(option);
		};

		let routeId = document.getElementById('routeIDDrones').value.replace("Route ID: ", "");
		return routeId;
		
	};

	selectDrone (data) {

		let routeId = document.getElementById('routeIDDrones').value.replace("Route ID: ", "");
		let selector = document.getElementById('droneSelector');
		let droneId = selector.options[selector.options.selectedIndex].text.replace("Drone ", "");
		
		let speed = document.getElementById('droneSpeedInput');
		let height = document.getElementById('droneHeightInput');

		if (routeId in data && droneId in data[routeId]) {
			speed.value = data[routeId][droneId].speed;
			height.value = data[routeId][droneId].height;
		};
	};

	getDroneData () {

		let routeId = document.getElementById('routeIDDrones').value.replace("Route ID: ", "");
		let selector = document.getElementById('droneSelector');
		let droneId = selector.options[selector.options.selectedIndex].text.replace("Drone ", "");

		let speed = parseFloat(document.getElementById('droneSpeedInput').value);
		let height = parseFloat(document.getElementById('droneHeightInput').value);

		let data = {
			routeId: routeId,
			droneId: droneId,
			speed: speed,
			height: height
		};

		return data;

	};

	updateDMF (button) {
		const exit = () => {
			document.getElementById('MainMenuForm').style.display = 'inherit';
			document.getElementById('DroneMenuForm').style.display = 'none';
		};

		if(button === 'save'){

			return this.getDroneData();

			// if (droneId === undefined) { exit() };

		};

		exit();
		return undefined;
	};

	updateDronePanel (droneController, droneId) {

		let droneIdField = document.getElementById("droneId");
		let droneSpeedField = document.getElementById("droneSpeed");
		let droneHeightField = document.getElementById("droneHeight");
		let droneInitBatField = document.getElementById("droneInitialBattery");
		let windSpeedField = document.getElementById("windSpeed");
		let rainForceField = document.getElementById("rainForce");

		// ==================================================

		let graphData = this.updateDroneGraph(droneController);
		let self  = this;
		this.graphInterval = setInterval(function() {
			
			self.updateDroneInterval(droneController.drones, graphData, self);

			let drone = droneController.drones[self.checkedDroneId];
			droneIdField.value = drone.model.id;
			droneSpeedField.value = drone.model.speed + ' m/s';
			droneHeightField.value = drone.model.height + ' m';
			droneInitBatField.value = drone.model.initialBatteryCapacity + ' %'
			windSpeedField.value = drone.model.dataEnv.windSpeed + ' m/s'
			rainForceField.value = drone.model.dataEnv.rainForce

		}, 2000);		

	};

	clearDroneInterval () {
		clearInterval(this.graphInterval);
		this.graphInterval = undefined;
	};

	updateDroneInterval (drones, graphData, self) {

		let drone = drones[self.checkedDroneId];
		if (drone === undefined) { self.clearDroneInterval(); return; };

		let exit_simullation = ( drone.model.badCodes.includes(drone.model.status.code) );
		if (exit_simullation) { self.clearDroneInterval(); return; };
	    
	    graphData.myChart.setOption({
	        xAxis: {
	        	name: 'Steps',
	        	nameLocation: 'center',
	            type: 'category',
	            boundaryGap: false,
	            data: graphData.dataX
	        },
	        yAxis: {
	        	name: 'Height',
	            type: 'value'
	        },
	        series: [{
	            data: graphData.dataY,
	            type: 'line',
	            areaStyle: {}
	        }]
	    });

	    if (graphData.dataX.length === 11) {
	        graphData.dataX.shift();
	        graphData.dataY.shift();
	    };

	    graphData.dataX.push(String(graphData.step));
	    graphData.dataY.push(drone.model.height);

	    graphData.step += 1;

	};

	updateDroneGraph (droneController) {
		let droneGraph = document.getElementById('droneGraph');
		droneGraph.removeChild(droneGraph.children[0]);
		droneGraph.appendChild(document.createElement("div"));
		droneGraph.children[0].style.width = '30em';
		droneGraph.children[0].style.height = '20em';

		if (this.graphInterval !== undefined) { this.clearDroneInterval(); };

        let myChart = echarts.init(droneGraph.children[0]);

        myChart.setOption({
		    title: {
		        text: 'Drone Height'
		    },
		    tooltip: {},
		    legend: {
		        data:['Steps']
		    },
		    xAxis: {
		        data: []
		    },
		    yAxis: {},
		    series: [{
		        name: 'Steps',
		        type: 'bar',
		        data: []
		    }]
		});

		let step = 0;
		let dataX = [];
		let dataY = [];

		let graphData = {
			myChart: myChart,
			step: step,
			dataX: dataX,
			dataY: dataY
		};
		return graphData;
	};
};
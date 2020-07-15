/*
npm init -yes
npm install ol --save-dev
npm install --save-dev parcel-bundler
*/

/*
	Definição básica para MVC:

	Model: Trabalha os dados e a lógica de negócios (O "COMO" TRABALHAR COM OS DADOS)

	View: Responsavel por receber e enviar os dados (O "ONDE" TRABALHAR COM OS DADOS)

	Controller: Interface entre o Model e o View (O "QUANDO" TRABALHAR COM OS DADOS)

	Entity: Resposavel pela "persistencia" dos dados (representa algo como um 
			banco de dados)
*/

import './public/css/telaBeta.css';
// import './public/fontawesome-free-5.11.2-web/css/all.min.css';
import 'ol/ol.css';

import {MainController} from './public/js/Controller/MainController.js';
var main = new MainController();

document.getElementById('slideButton').addEventListener('click', function (e) {
	main.updateSize();
}, false);

document.getElementById('geolocationButton').addEventListener('click', function (e) {
	main.geolocationSearch();
}, false);

document.getElementById('searchInput').addEventListener('keypress', function (e) {
	var key = e.which || e.keyCode;
	var address = document.getElementById('searchInput').value;
	main.searchAddress(key, address);
}, false);

document.getElementById('mouseButton').addEventListener('click', function (e) {
	main.drawOnClick(e.target.name);
}, false);

document.getElementById('routeButton').addEventListener('click', function (e) {
	main.drawOnClick(e.target.name);
}, false);

document.getElementById('envButton').addEventListener('click', function (e) {
	main.drawOnClick(e.target.name);
}, false);

document.getElementById('obstacleButton').addEventListener('click', function (e) {
	main.drawOnClick(e.target.name);
}, false);

document.getElementById('deleteDrawButton').addEventListener('click', function (e) {
	main.removeDrawedElement();
}, false);

document.getElementById('animationButton').addEventListener('click', function (e) {
	main.startDroneSimulation();
}, false);

document.getElementById('selectButton').addEventListener('click', function (e) {
	main.selectFeature();
}, false);

document.getElementById('saveButtonEMF').addEventListener('click', function (e) {
	main.updateEMF('save');
}, false);

document.getElementById('cancelButtonEMF').addEventListener('click', function (e) {
	main.updateEMF('cancel');
}, false);

document.getElementById('saveButtonDMF').addEventListener('click', function (e) {
	main.updateDMF('save');
}, false);

document.getElementById('cancelButtonDMF').addEventListener('click', function (e) {
	main.updateDMF('cancel');
}, false);

document.getElementById('saveButtonOMF').addEventListener('click', function (e) {
	main.updateOMF('save');
}, false);

document.getElementById('cancelButtonOMF').addEventListener('click', function (e) {
	main.updateOMF('cancel');
}, false);

document.getElementById('dronesNumberInput').addEventListener('keypress', function (e) {
	main.updateDroneNumberOnPath(e.target.value);
}, false);

document.getElementById('droneSelector').addEventListener('click', function (e) {
	main.selectDrone();
}, false);
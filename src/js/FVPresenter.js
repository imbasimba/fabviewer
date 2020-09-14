//"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

import Camera2 from './model/Camera2';
import RayPickingUtils from './utils/RayPickingUtils';
import SystemView from './view/SystemView';
import SystemPresenter from './presenter/SystemPresenter';
import CatalogueListView from './view/CatalogueListView';
import CatalogueListPresenter from './presenter/CatalogueListPresenter';
import SourceSelectionView from './view/SourceSelectionView';
import SourceSelectionPresenter from './presenter/SourceSelectionPresenter';
import CatalogueRepo from './repos/CatalogueRepo';
import ModelRepo from './repos/ModelRepo';
import {mat4, vec3} from 'gl-matrix';
import {cartesianToSpherical, sphericalToAstroDeg, raDegToHMS, decDegToDMS} from './utils/Utils';
import FoVUtils from './utils/FoVUtils';
import global from './Global';

class FVPresenter{
	constructor(in_view, in_gl){
		this.in_gl = in_gl;
		if (DEBUG){
			console.log("[FVPresenter::FVPresenter]");
		}

		this.neareastModel;
		this.enableCatalogues = true;
		this.init(in_view);
	}
	
	init(in_view){
		if (DEBUG){
			console.log("[FVPresenter::init]");
		}
		this.view = in_view;
		
		this.then = 0;
		this.camera = new Camera2([0.0, 0.0, 3.0]);
		global.camera = this.camera;
		this.raypicker = new RayPickingUtils();
		global.rayPicker = this.raypicker; 
		
		this.initPresenter();
		
		this.catalogueRepo = new CatalogueRepo("https://sky.esa.int/esasky-tap/catalogs", this.catalogueListPresenter.addCatalogues);
		
		this.modelRepo = new ModelRepo(this.in_gl, this.view.canvas, this.catalogueListPresenter.addCatalogues); 
		
		this.aspectRatio;
		this.fovDeg = 45;
		this.nearPlane = 0.1;
		this.farPlane = 10.0;
		
		// projection matrix
		this.pMatrix = mat4.create();
		
		this.mouseDown = false;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.inertiaX = 0.0
		this.inertiaY = 0.0

		
		this.addEventListeners();
		
		this.currentSeconds;
		this.elapsedTime;
		this.previousSeconds;
		
		this.nearestVisibleObjectIdx = 0;
//		RayPickingUtils.getNearestObjectOnRay(this.view.canvas.width / 2, this.view.canvas.height / 2, this.modelRepo);
		
//		RayPickingUtils.getNearestObjectOnRay(
//				this.view.canvas.width / 2, 
//				this.view.canvas.height / 2,
//				this.pMatrix,
//				this.camera,
//				this.in_gl.canvas,
//				this.modelRepo);
		
//		this.raypicker.getNearestObjectOnRay(
//				this.view.canvas.width / 2, 
//				this.view.canvas.height / 2,
//				this.pMatrix,
//				this.camera,
//				this.in_gl.canvas,
//				this.modelRepo);
		this.view.setPickedObjectName(this.modelRepo.objModels[this.nearestVisibleObjectIdx].name);
		
		this.lastDrawTime = (new Date()).getTime() * 0.001;
		
//		this.refreshViewAndModel();

	};
	
	initPresenter(){
		var systemView = new SystemView();
		this.systemPresenter = new SystemPresenter(systemView);
		this.view.appendChild(systemView.getHtml());
		this.systemPresenter.addFovPolyHandler(()=>{this.getFovPoly()});
		
		var catalogueListView = new CatalogueListView();
		this.catalogueListPresenter = new CatalogueListPresenter(catalogueListView);
		this.view.appendChild(catalogueListView.getHtml());
		
		
		var sourceSelView = new SourceSelectionView();
		this.sourceSelectionPresenter = new SourceSelectionPresenter(sourceSelView);
		this.view.appendChild(sourceSelView.html);
		
	};
	
	getFovPoly(){
		
		console.log("this.getFovPoly");
		
		var raDecDeg = FoVUtils.getFoVPolygon(
				this.pMatrix,
				this.camera,
				this.in_gl.canvas,
				(this.modelRepo.objModels[this.neareastModel.idx])
				);
//		var raDecDeg = FoVUtils.getFoVPolygon(
//				this.pMatrix,
//				this.camera,
//				in_gl.canvas,
//				(this.modelRepo.objModels[this.neareastModel.idx]),
//				this.raypicker
//				);

		console.log(raDecDeg);
			
		
	};
	
	


	addEventListeners(){
		if (DEBUG){
			console.log("[FVPresenter::addEventListeners]");
		}

		var handleMouseDown = (event) => {
			this.view.canvas.setPointerCapture(event.pointerId);
			this.mouseDown = true;
			
			this.lastMouseX = event.pageX;
			this.lastMouseY = event.pageY;

			event.preventDefault();
            return false;
		}
		
		var handleMouseUp = (event) => {
			this.view.canvas.releasePointerCapture(event.pointerId);
			this.mouseDown = false;
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			this.lastMouseX = event.clientX;
			this.lastMouseY = event.clientY;
			
			
			var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(this.lastMouseX, this.lastMouseY, this.modelRepo);
			if (intersectionWithModel.intersectionPoint.intersectionPoint === undefined){
				return;
			}
			if (intersectionWithModel.intersectionPoint.intersectionPoint.length > 0){
				
				var phiThetaDeg = cartesianToSpherical(intersectionWithModel.intersectionPoint.intersectionPoint);
				var raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
				var raHMS = raDegToHMS(raDecDeg.ra);
				var decDMS = decDegToDMS(raDecDeg.dec);
				this.view.setPickedSphericalCoordinates(phiThetaDeg);
				this.view.setPickedAstroCoordinates(raDecDeg, raHMS, decDMS);
				
				this.view.setPickedObjectName(intersectionWithModel.pickedObject.name);
				
			}else{
				console.log("no intersection");
			}	
			this.nearestVisibleObjectIdx = intersectionWithModel.idx;

		}
		

		var handleMouseMove = (event) => {
			var newX = event.clientX;
			var newY = event.clientY;

			if (this.mouseDown) {
				
				document.getElementsByTagName("body")[0].style.cursor = "grab";

				var deltaX = (newX - this.lastMouseX)*Math.PI/this.view.canvas.width;
		     	var deltaY = (newY - this.lastMouseY)*Math.PI/this.view.canvas.width;
				
		     	this.inertiaX += 0.1 * deltaX;
				this.inertiaY += 0.1 * deltaY;

				
			}else{
				
				// TODO 
				/**
				 * algo for source picking
				 * do raypicking against the HiPS sphere each draw cycle with mouse coords converted into model coords
				 * pass these coords to the fragment shader (catalogue fragment shader)
				 * In the fragment shader, compute if the segment from mouse coords and source point is less than the point radius (gl_PointSize)
				 * 
				 */
				
				var mousePicker = RayPickingUtils.getIntersectionPointWithSingleModel(newX, newY);
				var mousePoint = mousePicker.intersectionPoint;
				var mouseObjectPicked = mousePicker.pickedObject;
				if (mousePoint !== undefined){
					
					if (mousePoint.length > 0){
						
						var phiThetaDeg = cartesianToSpherical(mousePoint);
						var raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
						var raHMS = raDegToHMS(raDecDeg.ra);
						var decDMS = decDegToDMS(raDecDeg.dec);
						this.view.setPickedSphericalCoordinates(phiThetaDeg);
						this.view.setPickedAstroCoordinates(raDecDeg, raHMS, decDMS);
						this.view.setPickedObjectName(mouseObjectPicked.name);
						this.mouseCoords = mousePoint;
						
					}else{
						this.mouseCoords = null;
						console.log("no intersection");
					}	
					
				}
				
				
			}
			
			
			

			this.lastMouseX = newX;
			this.lastMouseY = newY;
			event.preventDefault();
		}
		
		
		this.zoomIn = false;
		this.zoomOut = false;
		this.Xrot = 0;
		this.Yrot = 0;
		this.XYrot = [0, 0];
		this.keyPressed = false;
		
		
		var handleKeyUp = (event) => {
			this.keyPressed = false;
			this.zoomIn = false;
			this.zoomOut = false;
			this.Xrot = 0;
			this.Yrot = 0;
			this.XYrot = [0, 0];
			this.keyPressed = false;
		}
		
		var handleKeyPress = (event) => {
			
			var code = event.keyCode;

			var move = vec3.clone([0, 0, 0]);
			var rotStep = 0.01;
			var pan = false;
			switch (code) {
				case 38:// arrowUp
					this.zoomIn = true;
					break;
				case 40:// arrowDown
					this.zoomOut = true;
					break;
				case 87:// W
					this.Xrot = -1;
					break;
				case 88:// X
					this.Xrot = 1;
					break;
				case 68:// A
					this.Yrot = 1;
					break;
				case 65:// D
					this.Yrot = -1;
					break;
				case 81:// Q
					this.XYrot = [-rotStep, -rotStep];
					break;
				case 69:// E
					this.XYrot = [rotStep, -rotStep];
					break;
				case 90:// Z
					this.XYrot = [-rotStep, rotStep];
					break;
				case 67:// C
					this.XYrot = [rotStep, rotStep];
					break;
			}
			this.keyPressed = true;

		}
		


		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('keyup', handleKeyUp);
		
		this.view.canvas.onpointerdown = handleMouseDown;
		this.view.canvas.onpointerup = handleMouseUp;
		this.view.canvas.onpointermove = handleMouseMove;
		
	};
	
	refreshFov(neareastModelIdx){
		if (DEBUG){
			console.log("[FVPresenter::refreshFov]");
		}

		var selectedModel = this.modelRepo.objModels[neareastModelIdx];

		var fovXY =  selectedModel.refreshFoV();
		return fovXY;
		
	};
	
	refreshModel(neareastModelIdx, fov, pan){
		if (DEBUG){
			console.log("[FVPresenter::refreshModel]");
		}


		var selectedModel = this.modelRepo.objModels[neareastModelIdx];
		global.model = selectedModel;
		// compute FoV against the nearest object
		// TODO this should be an object variable
		selectedModel.refreshModel(fov, pan);

	};
	

	refreshViewAndModel(pan) {

		this.neareastModel = RayPickingUtils.getNearestObjectOnRay(this.view.canvas.width / 2, this.view.canvas.height / 2, this.modelRepo);
		var fovObj = this.refreshFov(this.neareastModel.idx);
		this.view.updateFoV(fovObj);
		this.refreshModel(this.neareastModel.idx, fovObj.minFoV, pan);
	};
	
	
	
	
	draw(now){

		this.systemPresenter.refreshModel();
		var elapsedTime = this.systemPresenter.getElapsedTime();
		this.aspectRatio = this.view.canvas.width / this.view.canvas.height;
		
		var THETA, PHI;
		if (this.mouseDown) {
			THETA = 0.3 * this.inertiaY;
			PHI = 0.3 * this.inertiaX;
			this.inertiaX *= 0.95;
			this.inertiaY *= 0.95;	
			this.camera.rotate(PHI, THETA);
//			refreshViewAndModel(false);
		}else{
			this.inertiaY = 0;
			this.inertiaX = 0;
		}
		

		if(this.keyPressed){
			if(this.zoomIn){
				this.camera.zoomIn(elapsedTime * 0.1);
				this.refreshViewAndModel(false);
			}else if(this.zoomOut){
				this.camera.zoomOut(elapsedTime * 0.1);
				this.refreshViewAndModel(false);
			}
			
			if (this.Yrot != 0){
				this.camera.rotateY(this.Yrot);
				this.refreshViewAndModel(true);
			}else if (this.Xrot != 0){
				this.camera.rotateX(this.Xrot);
				this.refreshViewAndModel(true);
			}else if(this.XYrot[0] != 0 && this.XYrot[1] != 0){
				this.camera.rotate(this.XYrot[0], this.XYrot[1]);
				this.refreshViewAndModel(true);
			}
		}
//		global.camera = this.camera;
		
		this.in_gl.viewport(0, 0, this.in_gl.viewportWidth, this.in_gl.viewportHeight);
		this.in_gl.clear(this.in_gl.COLOR_BUFFER_BIT | this.in_gl.DEPTH_BUFFER_BIT);
//		global.gl = this.in_gl;
		
		// TODO move this part outside the draw loop. Not needed to reset the perspective matrix every loop cycle
		mat4.perspective(this.pMatrix, this.fovDeg, this.aspectRatio, this.nearPlane, this.farPlane);

		if (global.pMatrix == null){
			console.log("Initializing view and model");
			global.pMatrix = this.pMatrix;
			this.refreshViewAndModel();

		}
		
		for (var i = 0; i < this.modelRepo.objModels.length; i++){
			
			this.modelRepo.objModels[i].draw(this.pMatrix, this.camera.getCameraMatrix());
			
		}
		
		
		var mMatrix = this.modelRepo.objModels[0].getModelMatrix();
		
		var k,
		catalogue;
		for (k = 0; k < CatalogueRepo.catalogues.length; k++){
			catalogue = CatalogueRepo.catalogues[k];
			catalogue.draw(mMatrix, this.mouseCoords);
		}
		
		
		
//		this.xyzRefSystemObj.draw(this.pMatrix, this.camera.getCameraMatrix());
	};
	
	
}

export default FVPresenter;
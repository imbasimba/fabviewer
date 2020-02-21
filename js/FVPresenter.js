/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

function FVPresenter(in_view, in_gl){
	if (DEBUG){
		console.log("[FVPresenter::FVPresenter]");
	}
	var currentObj = this;
	
	this.init = function (){
		if (DEBUG){
			console.log("[FVPresenter::init]");
		}
		currentObj.view = in_view;

		currentObj.then = 0;
		currentObj.camera = new Camera2([0.0, 0.0, 3.0]);

		currentObj.raypicker = new RayPickingUtils();

		currentObj.modelRepo = new ModelRepo(in_gl, currentObj.view.canvas);
		
		currentObj.aspectRatio;
		currentObj.fovDeg = 45;
		currentObj.nearPlane = 0.1;
		currentObj.farPlane = 10.0;
		
		// projection matrix
		currentObj.pMatrix = mat4.create();
		mat4.identity(currentObj.pMatrix);
		
		currentObj.mouseDown = false;
		currentObj.lastMouseX = null;
		currentObj.lastMouseY = null;
		currentObj.inertiaX = 0.0
		currentObj.inertiaY = 0.0

		
		currentObj.addEventListeners();
		
		currentObj.currentSeconds;
		currentObj.elapsedTime;
		currentObj.previousSeconds;
		
		currentObj.nearestVisibleObjectIdx = 0;
		currentObj.raypicker.getNearestObjectOnRay(
				currentObj.view.canvas.width / 2, 
				currentObj.view.canvas.height / 2,
				currentObj.pMatrix,
				currentObj.camera,
				in_gl.canvas,
				currentObj.modelRepo);
		currentObj.view.setPickedObjectName(currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx].name);

	};


	this.addEventListeners = function(){
		if (DEBUG){
			console.log("[FVPresenter::addEventListeners]");
		}

		function handleMouseDown(event) {
			currentObj.mouseDown = true;
			
			currentObj.lastMouseX = event.pageX;
			currentObj.lastMouseY = event.pageY;

			event.preventDefault();
            return false;
		}
		
		function handleMouseUp(event) {
			
			currentObj.mouseDown = false;
			document.getElementsByTagName("body")[0].style.cursor = "auto";
			currentObj.lastMouseX = event.clientX;
			currentObj.lastMouseY = event.clientY;
			
			
			var intersectionWithModel = currentObj.raypicker.getIntersectionPointWithModel(
					currentObj.lastMouseX, 
					currentObj.lastMouseY, 
					currentObj.pMatrix, 
					currentObj.camera, 
					in_gl.canvas, 
					currentObj.modelRepo
					);
//			console.log("[FVPresenter::handleMouseUp] intersectionWithModel.intersectionPoint "+intersectionWithModel.intersectionPoint);
			if (intersectionWithModel.intersectionPoint.intersectionPoint.length > 0){
				
				var phiThetaDeg = cartesianToSpherical(intersectionWithModel.intersectionPoint.intersectionPoint);
				var raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
				var raHMS = raDegToHMS(raDecDeg.ra);
				var decDMS = decDegToDMS(raDecDeg.dec);
				currentObj.view.setPickedSphericalCoordinates(phiThetaDeg);
				currentObj.view.setPickedAstroCoordinates(raDecDeg, raHMS, decDMS);
				
				currentObj.view.setPickedObjectName(intersectionWithModel.pickedObject.name);
				
			}else{
				console.log("no intersection");
			}	
			currentObj.nearestVisibleObjectIdx = intersectionWithModel.idx;

		}
		

		function handleMouseMove(event) {

			var newX = event.clientX;
			var newY = event.clientY;

			if (currentObj.mouseDown) {
				
				document.getElementsByTagName("body")[0].style.cursor = "grab";

				var deltaX = (newX - currentObj.lastMouseX)*Math.PI/currentObj.view.canvas.width;
		     	var deltaY = (newY - currentObj.lastMouseY)*Math.PI/currentObj.view.canvas.width;
				
				currentObj.inertiaX += 0.3 * deltaX
				currentObj.inertiaY += 0.3 * deltaY

			}

			currentObj.lastMouseX = newX;
			currentObj.lastMouseY = newY;
			event.preventDefault();
		}
		
		function handleKeyPress(event) {
			var code = event.keyCode;

			var move = vec3.create([0, 0, 0]);
			var rotStep = 0.01;
			var pan = false;
			switch (code) {
				case 38:// arrowUp
					currentObj.camera.zoomIn(currentObj.elapsedTime);
					break;
				case 40:// arrowDown
					currentObj.camera.zoomOut(currentObj.elapsedTime);
					break;
				case 87:// W
					currentObj.camera.rotateX(1);
					pan = true;
					break;
				case 88:// X
					currentObj.camera.rotateX(-1);
					pan = true;
					break;
				case 68:// A
					// TODO check and update nearest object
					currentObj.camera.rotateY(-1);
					pan = true;
					break;
				case 65:// D
					// TODO check and update nearest object
					currentObj.camera.rotateY(1);
					pan = true;
					break;
				case 81:// Q
					currentObj.camera.rotate(rotStep, rotStep);
					pan = true;
					break;
				case 69:// E
					currentObj.camera.rotate(rotStep, -rotStep);
					pan = true;
					break;
				case 90:// Z
					currentObj.camera.rotate(-rotStep, rotStep);
					pan = true;
					break;
				case 67:// C
					currentObj.camera.rotate(-rotStep, -rotStep);
					pan = true;
					break;
			}

			var neareastModel = currentObj.raypicker.getNearestObjectOnRay(
					currentObj.view.canvas.width / 2, 
					currentObj.view.canvas.height / 2,
					currentObj.pMatrix,
					currentObj.camera,
					in_gl.canvas,
					currentObj.modelRepo);
						
			var fovObj = currentObj.refreshFov(neareastModel.idx);
			currentObj.view.updateFoV(fovObj);
			currentObj.refreshModel(neareastModel.idx, fovObj.getMinFoV(), pan);
		}

		window.addEventListener('keydown', handleKeyPress);
		
		currentObj.view.canvas.onmousedown = handleMouseDown;
		currentObj.view.canvas.onmouseup = handleMouseUp;
		currentObj.view.canvas.onmousemove = handleMouseMove;
		
	};
	
	this.refreshFov = function(neareastModelIdx){
		if (DEBUG){
			console.log("[FVPresenter::refreshFov]");
		}

		var selectedModel = currentObj.modelRepo.objModels[neareastModelIdx];

		var fovXY =  selectedModel.refreshFoV(
				currentObj.pMatrix,
				currentObj.camera, 
				currentObj.raypicker);
		
		return fovXY;
		
	};
	
	this.refreshModel = function(neareastModelIdx, fov, pan){
		if (DEBUG){
			console.log("[FVPresenter::refreshModel]");
		}
		console.log("[FVPresenter::refreshModel]");

		var selectedModel = currentObj.modelRepo.objModels[neareastModelIdx];
		// compute FoV against the nearest object
		// TODO this should be an object variable
		selectedModel.refreshModel(
				fov, pan, 
				currentObj.camera,
				currentObj.pMatrix,
				in_gl.canvas, 
				currentObj.raypicker);
		
		
	};
	
	
	
	this.draw = function(now){

		now *= 0.01;
		currentObj.elapsedTime = now - currentObj.then;
		currentObj.then = now;
		
		currentObj.aspectRatio = currentObj.view.canvas.width / currentObj.view.canvas.height;
		
		var THETA, PHI;
		if (currentObj.mouseDown) {
			THETA = 0.3 * this.inertiaY;
			PHI = 0.3 * this.inertiaX;
			currentObj.inertiaX *= 0.95;
			currentObj.inertiaY *= 0.95;	
			currentObj.camera.rotate(PHI, THETA);
		}else{
			this.inertiaY = 0;
			this.inertiaX = 0;
		}
		

		
		in_gl.viewport(0, 0, in_gl.viewportWidth, in_gl.viewportHeight);
		in_gl.clear(in_gl.COLOR_BUFFER_BIT | in_gl.DEPTH_BUFFER_BIT);
		mat4.perspective( currentObj.fovDeg, currentObj.aspectRatio, currentObj.nearPlane, currentObj.farPlane, currentObj.pMatrix );
		
		for (var i = 0; i < currentObj.modelRepo.objModels.length; i++){
			
			currentObj.modelRepo.objModels[i].draw(currentObj.pMatrix, currentObj.camera.getCameraMatrix());
			
		}

	};
	
	
	this.init();
}
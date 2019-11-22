/**
 * @author Fabrizio Giordano (Fab)
 */
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
//		currentObj.camera = new Camera([0.0, 0.0, 0.5]);
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
		currentObj.getNearestObjectOnRay(currentObj.view.canvas.width / 2, currentObj.view.canvas.heigth / 2);
		currentObj.view.setPickedObjectName(currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx].name);
		
		currentObj.THETA = 0;
		currentObj.PHI = 0;
		
//		currentObj.xyzRefSystem = new XYZSystem2(in_gl, x, y);
		
	};
	
	this.getNearestObjectOnRay = function(mouseX, mouseY){
		
		currentObj.mouseDown = false;
		document.getElementsByTagName("body")[0].style.cursor = "auto";
		currentObj.lastMouseX = mouseX;
		currentObj.lastMouseY = mouseY;
		
		var intersectionDistance;
		currentObj.nearestVisibleObjectIdx = 0;
		var currModel;
		var nearestVisibleIntersectionDistance = undefined;
		
		var rayWorld = currentObj.raypicker.getRayFromMouse(currentObj.lastMouseX, 
				currentObj.lastMouseY, 
				currentObj.pMatrix, 
				currentObj.camera.getCameraMatrix(), 
				in_gl.canvas);
		if (DEBUG){
			console.log("[FVPresenter::getNearestObjectOnRay] rayWorld "+rayWorld);
			console.log(currentObj.modelRepo.objModels);
		}
		
		for (var i = 0; i < currentObj.modelRepo.objModels.length; i++){
			
			currModel = currentObj.modelRepo.objModels[i];
			intersectionDistance = currentObj.raypicker.raySphere(currentObj.camera.getCameraPosition(), rayWorld, currModel);
			if (DEBUG){
				console.log("[FVPresenter::getNearestObjectOnRay] intersectionDistance "+intersectionDistance + " object "+currModel.name);
			}
			if (intersectionDistance >= 0){
				if (nearestVisibleIntersectionDistance === undefined || intersectionDistance < nearestVisibleIntersectionDistance){
					nearestVisibleIntersectionDistance = intersectionDistance;
					currentObj.nearestVisibleObjectIdx = i;
				}
			}
		}
		if (nearestVisibleIntersectionDistance >= 0){
			if (DEBUG){
				console.log("[FVPresenter]::getNearestObjectOnRay nearest object name "+currModel.name);
				
			}
			return nearestVisibleIntersectionDistance;
		}
		return -1;
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
			
			var closestObj = -1;
			var closestIntersection = 0.0;

			var rayWorld = currentObj.raypicker.getRayFromMouse(currentObj.lastMouseX, 
											currentObj.lastMouseY, 
											currentObj.pMatrix, 
											currentObj.camera.getCameraMatrix(), 
											in_gl.canvas);
			console.log("[FVPresenter::handleMouseUp] rayWorld "+rayWorld);
			var intersectionPoint;
			var intersectionModelPoint = [];
			var intersectionPoint4d;
			var pickedObject;
			
			currentObj.nearestVisibleObjectIdx = 0;
			
			var nearestVisibleIntersectionDistance = currentObj.getNearestObjectOnRay(event.clientX, event.clientY);
			
			if (DEBUG){
				console.log("[FVPresenter::handleMouseUp] nearestVisibleIntersectionDistance " + nearestVisibleIntersectionDistance);
			}
			
			if (nearestVisibleIntersectionDistance >= 0){
				
				pickedObject = currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx];
				
				intersectionPoint = vec3.create();
				vec3.scale(rayWorld, nearestVisibleIntersectionDistance, intersectionPoint);
				vec3.add(currentObj.camera.getCameraPosition(), intersectionPoint, intersectionPoint);
				console.log("World intersectionPoint:");
				console.log(intersectionPoint);
				
				intersectionModelPoint = [];
				
				intersectionPoint4d = [intersectionPoint[0], intersectionPoint[1], intersectionPoint[2], 1.0];
				mat4.multiplyVec4(pickedObject.getModelMatrixInverse(), intersectionPoint4d, intersectionModelPoint);
				
				console.log("Model intersectionPoint:");
				console.log(intersectionModelPoint);
				
				var phiThetaDeg = cartesianToSpherical(intersectionModelPoint);
				var raDecDeg = sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
				var raHMS = raDegToHMS(raDecDeg.ra);
				var decDMS = decDegToDMS(raDecDeg.dec);
				currentObj.view.setPickedSphericalCoordinates(phiThetaDeg);
				currentObj.view.setPickedAstroCoordinates(raDecDeg, raHMS, decDMS);
				
				currentObj.view.setPickedObjectName(pickedObject.name);
				
				console.log("ROTATION MATRIX on picking "+pickedObject.R);
				console.log("MODEL MATRIX on picking "+pickedObject.modelMatrix);
				
			}else{
				console.log("no intersection");
			}	

		}
		

		function handleMouseMove(event) {

			var newX = event.clientX;
			var newY = event.clientY;

			if (currentObj.mouseDown) {
				
				document.getElementsByTagName("body")[0].style.cursor = "grab";

				var deltaX = (newX - currentObj.lastMouseX)*Math.PI/currentObj.view.canvas.width;
		     	var deltaY = (newY - currentObj.lastMouseY)*Math.PI/currentObj.view.canvas.width;
				
		     	//currentObj.THETA = deltaY + 0.0 * currentObj.inertiaY;
				//currentObj.PHI = deltaX + 0.0 * currentObj.inertiaX;

				currentObj.inertiaX += 0.3 * deltaX
				currentObj.inertiaY += 0.3 * deltaY
				 
				//console.log("[FVPresenter::ROTATING] "+deltaY);
		     			     	
				//var currModel = currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx];
				//console.log("[FVPresenter::ROTATING] "+currModel.name);
				//currentObj.camera.rotate(currentObj.PHI, currentObj.THETA);
			}

			currentObj.lastMouseX = newX;
			currentObj.lastMouseY = newY;
			event.preventDefault();
		}
		
		function handleKeyPress(event) {
			var code = event.keyCode;
			console.log(code);
			console.log("elapsedTime " + currentObj.elapsedTime);
			console.log("performance.now() " + performance.now());
			
			var move = vec3.create([0, 0, 0]);
			var rotStep = 0.01;
			switch (code) {
				case 38:// arrowUp
//					move[2] = -0.01;
//					currentObj.camera.translate(move);
//					currentObj.camera.refreshViewMatrix();
//					move = [0, 0, 0];
					currentObj.camera.zoomIn(currentObj.elapsedTime);
					
					break;
				case 40:// arrowDown
//					move[2] = +0.01;
//					currentObj.camera.translate(move);
//					currentObj.camera.refreshViewMatrix();
//					move = [0, 0, 0];
					currentObj.camera.zoomOut(currentObj.elapsedTime);
					break;
				case 87:// W
//					currentObj.camera.rotate(rotStep, 0.0);
//					currentObj.camera.refreshViewMatrix();
					currentObj.camera.rotateX(1);
					
					break;
				case 88:// X
//					currentObj.camera.rotate(-rotStep, 0.0);
//					currentObj.camera.refreshViewMatrix();
					currentObj.camera.rotateX(-1);
					break;
				case 68:// A
					// TODO check and update nearest object
//					currentObj.camera.rotate(0.0, -rotStep);
//					currentObj.camera.refreshViewMatrix();
					currentObj.camera.rotateY(-1);
					
					
					break;
				case 65:// D
					// TODO check and update nearest object
//					currentObj.camera.rotate(0.0, rotStep);
//					currentObj.camera.refreshViewMatrix();
					currentObj.camera.rotateY(1);
					break;
				case 81:// Q
					currentObj.camera.rotate(rotStep, rotStep);
					break;
				case 69:// E
					currentObj.camera.rotate(rotStep, -rotStep);
					break;
				case 90:// Z
					currentObj.camera.rotate(-rotStep, rotStep);
					break;
				case 67:// C
					currentObj.camera.rotate(-rotStep, -rotStep);
					break;
			}
			
			currentObj.computeFov();
		}

		window.addEventListener('keydown', handleKeyPress);
		
		currentObj.view.canvas.onmousedown = handleMouseDown;
		currentObj.view.canvas.onmouseup = handleMouseUp;
		currentObj.view.canvas.onmousemove = handleMouseMove;
		
	};
	
	this.computeFov = function(){
		if (DEBUG){
			console.log("[FVPresenter::computeFov]");
		}
		var selectedModel = currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx];
		// compute FoV against the nearest object
		var fovXY =  selectedModel.getFoV(
				currentObj.pMatrix,
				currentObj.camera, 
				currentObj.raypicker);
				
		currentObj.view.updateFoV(fovXY);
		
//		selectedModel.setGeometryNeedsToBeRefreshed();
		
	};
	
	this.draw = function(now){
		
		
//		currentObj.currentSeconds = performance.now();
//		currentObj.elapsedTime = (currentObj.currentSeconds - currentObj.previousSeconds) * 0.001;
//		currentObj.previousSeconds = currentObj.currentSeconds;
//console.log("now "+now+ " currentObj.then "+currentObj.then);
		now *= 0.01;
		currentObj.elapsedTime = now - currentObj.then;
		currentObj.then = now;
		
		currentObj.aspectRatio = currentObj.view.canvas.width / currentObj.view.canvas.height;
		
		currentObj.THETA = 0.3 * this.inertiaY;
		currentObj.PHI = 0.3 * this.inertiaX;
		currentObj.camera.rotate(currentObj.PHI, currentObj.THETA);
		currentObj.inertiaX *= 0.95;
		currentObj.inertiaY *= 0.95;

		in_gl.viewport(0, 0, in_gl.viewportWidth, in_gl.viewportHeight);
		in_gl.clear(in_gl.COLOR_BUFFER_BIT | in_gl.DEPTH_BUFFER_BIT);
		mat4.perspective( currentObj.fovDeg, currentObj.aspectRatio, currentObj.nearPlane, currentObj.farPlane, currentObj.pMatrix );
		
		for (var i = 0; i < currentObj.modelRepo.objModels.length; i++){
			
			currentObj.modelRepo.objModels[i].draw(currentObj.pMatrix, currentObj.camera.getCameraMatrix());
			
		}
		
//		currentObj.camera.xyzRefSystem.draw(currentObj.camera.shaderProgram);

	};
	
	
	this.init();
}
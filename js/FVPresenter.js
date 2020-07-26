//"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */
function FVPresenter(in_view, in_gl){
	if (DEBUG){
		console.log("[FVPresenter::FVPresenter]");
	}
	var currentObj = this;
	var systemPresenter;
	var catalogueListPresenter;
	
	this.init = function (){
		if (DEBUG){
			console.log("[FVPresenter::init]");
		}
		currentObj.view = in_view;
		
		currentObj.then = 0;
		currentObj.camera = new Camera2([0.0, 0.0, 3.0]);
		global.camera = currentObj.camera;
		currentObj.raypicker = new RayPickingUtils();
		global.rayPicker = currentObj.raypicker; 
		
		currentObj.initPresenter();
		
		currentObj.catalogueRepo = new CatalogueRepo("https://sky.esa.int/esasky-tap/catalogs", catalogueListPresenter.addCatalogues);
		
		currentObj.modelRepo = new ModelRepo(in_gl, currentObj.view.canvas, catalogueListPresenter.addCatalogues); 
		
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
//		RayPickingUtils.getNearestObjectOnRay(currentObj.view.canvas.width / 2, currentObj.view.canvas.height / 2, currentObj.modelRepo);
		
//		RayPickingUtils.getNearestObjectOnRay(
//				currentObj.view.canvas.width / 2, 
//				currentObj.view.canvas.height / 2,
//				currentObj.pMatrix,
//				currentObj.camera,
//				in_gl.canvas,
//				currentObj.modelRepo);
		
//		currentObj.raypicker.getNearestObjectOnRay(
//				currentObj.view.canvas.width / 2, 
//				currentObj.view.canvas.height / 2,
//				currentObj.pMatrix,
//				currentObj.camera,
//				in_gl.canvas,
//				currentObj.modelRepo);
		currentObj.view.setPickedObjectName(currentObj.modelRepo.objModels[currentObj.nearestVisibleObjectIdx].name);
		
		this.lastDrawTime = (new Date()).getTime() * 0.001;
		
//		this.refreshViewAndModel();

	};
	
	this.initPresenter = function(){
		var systemView = new SystemView();
		systemPresenter = new SystemPresenter(systemView);
		currentObj.view.appendChild(systemView.getHtml());
		systemPresenter.addFovPolyHandler(currentObj.getFovPoly);
		
		var catalogueListView = new CatalogueListView();
		catalogueListPresenter = new CatalogueListPresenter(catalogueListView);
		currentObj.view.appendChild(catalogueListView.getHtml());
	};
	
	this.getFovPoly = function(){
		
		console.log("this.getFovPoly");
		
		var raDecDeg = FoVUtils.getFoVPolygon(
				currentObj.pMatrix,
				currentObj.camera,
				in_gl.canvas,
				(currentObj.modelRepo.objModels[currentObj.neareastModel.idx])
				);
//		var raDecDeg = FoVUtils.getFoVPolygon(
//				currentObj.pMatrix,
//				currentObj.camera,
//				in_gl.canvas,
//				(currentObj.modelRepo.objModels[currentObj.neareastModel.idx]),
//				currentObj.raypicker
//				);

		console.log(raDecDeg);
			
		
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
			
			
			var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(currentObj.lastMouseX, currentObj.lastMouseY, currentObj.modelRepo);
//			var intersectionWithModel = RayPickingUtils.getIntersectionPointWithModel(
//					currentObj.lastMouseX, 
//					currentObj.lastMouseY, 
//					currentObj.pMatrix, 
//					currentObj.camera, 
//					in_gl.canvas, 
//					currentObj.modelRepo
//					);
//			var intersectionWithModel = currentObj.raypicker.getIntersectionPointWithModel(
//					currentObj.lastMouseX, 
//					currentObj.lastMouseY, 
//					currentObj.pMatrix, 
//					currentObj.camera, 
//					in_gl.canvas, 
//					currentObj.modelRepo
//					);
//			console.log("[FVPresenter::handleMouseUp] intersectionWithModel.intersectionPoint "+intersectionWithModel.intersectionPoint);
			if (intersectionWithModel.intersectionPoint.intersectionPoint === undefined){
				return;
			}
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
				
		     	currentObj.inertiaX += 0.1 * deltaX;
				currentObj.inertiaY += 0.1 * deltaY;
				
			}
			
			
			

			currentObj.lastMouseX = newX;
			currentObj.lastMouseY = newY;
			event.preventDefault();
		}
		
		
		currentObj.zoomIn = false;
		currentObj.zoomOut = false;
		currentObj.Xrot = 0;
		currentObj.Yrot = 0;
		currentObj.XYrot = [0, 0];
		currentObj.keyPressed = false;
		
		
		function handleKeyUp(event) {
			currentObj.keyPressed = false;
			currentObj.zoomIn = false;
			currentObj.zoomOut = false;
			currentObj.Xrot = 0;
			currentObj.Yrot = 0;
			currentObj.XYrot = [0, 0];
			currentObj.keyPressed = false;
		}
		
		function handleKeyPress(event) {
			
			var code = event.keyCode;

			var move = vec3.create([0, 0, 0]);
			var rotStep = 0.01;
			var pan = false;
			switch (code) {
				case 38:// arrowUp
					currentObj.zoomIn = true;
					break;
				case 40:// arrowDown
					currentObj.zoomOut = true;
					break;
				case 87:// W
					currentObj.Xrot = -1;
					break;
				case 88:// X
					currentObj.Xrot = 1;
					break;
				case 68:// A
					currentObj.Yrot = 1;
					break;
				case 65:// D
					currentObj.Yrot = -1;
					break;
				case 81:// Q
					currentObj.XYrot = [-rotStep, -rotStep];
					break;
				case 69:// E
					currentObj.XYrot = [rotStep, -rotStep];
					break;
				case 90:// Z
					currentObj.XYrot = [-rotStep, rotStep];
					break;
				case 67:// C
					currentObj.XYrot = [rotStep, rotStep];
					break;
			}
			currentObj.keyPressed = true;

		}
		


		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('keyup', handleKeyUp);
		
		currentObj.view.canvas.onmousedown = handleMouseDown;
		currentObj.view.canvas.onmouseup = handleMouseUp;
		currentObj.view.canvas.onmousemove = handleMouseMove;
		
	};
	
	this.refreshFov = function(neareastModelIdx){
		if (DEBUG){
			console.log("[FVPresenter::refreshFov]");
		}

		var selectedModel = currentObj.modelRepo.objModels[neareastModelIdx];

		var fovXY =  selectedModel.refreshFoV();
		return fovXY;
		
	};
	
	this.refreshModel = function(neareastModelIdx, fov, pan){
		if (DEBUG){
			console.log("[FVPresenter::refreshModel]");
		}


		var selectedModel = currentObj.modelRepo.objModels[neareastModelIdx];
		global.model = selectedModel;
		// compute FoV against the nearest object
		// TODO this should be an object variable
		selectedModel.refreshModel(fov, pan);

	};
	
	this.neareastModel;
	this.refreshViewAndModel = function(pan) {

		currentObj.neareastModel = RayPickingUtils.getNearestObjectOnRay(currentObj.view.canvas.width / 2, currentObj.view.canvas.height / 2, currentObj.modelRepo);
		var fovObj = currentObj.refreshFov(currentObj.neareastModel.idx);
		currentObj.view.updateFoV(fovObj);
		currentObj.refreshModel(currentObj.neareastModel.idx, fovObj.minFoV, pan);
	};
	
	
	this.enableCatalogues = true;
	
	
	this.draw = function(now){

		systemPresenter.refreshModel();
		var elapsedTime = systemPresenter.getElapsedTime();
		currentObj.aspectRatio = currentObj.view.canvas.width / currentObj.view.canvas.height;
		
		var THETA, PHI;
		if (currentObj.mouseDown) {
			THETA = 0.3 * currentObj.inertiaY;
			PHI = 0.3 * currentObj.inertiaX;
			currentObj.inertiaX *= 0.95;
			currentObj.inertiaY *= 0.95;	
			currentObj.camera.rotate(PHI, THETA);
//			refreshViewAndModel(false);
		}else{
			currentObj.inertiaY = 0;
			currentObj.inertiaX = 0;
		}
		

		if(currentObj.keyPressed){
			if(currentObj.zoomIn){
				currentObj.camera.zoomIn(elapsedTime * 0.1);
				currentObj.refreshViewAndModel(false);
			}else if(currentObj.zoomOut){
				currentObj.camera.zoomOut(elapsedTime * 0.1);
				currentObj.refreshViewAndModel(false);
			}
			
			if (currentObj.Yrot != 0){
				currentObj.camera.rotateY(currentObj.Yrot);
				currentObj.refreshViewAndModel(true);
			}else if (currentObj.Xrot != 0){
				currentObj.camera.rotateX(currentObj.Xrot);
				currentObj.refreshViewAndModel(true);
			}else if(currentObj.XYrot[0] != 0 && currentObj.XYrot[1] != 0){
				currentObj.camera.rotate(currentObj.XYrot[0], currentObj.XYrot[1]);
				currentObj.refreshViewAndModel(true);
			}
		}
//		global.camera = currentObj.camera;
		
		in_gl.viewport(0, 0, in_gl.viewportWidth, in_gl.viewportHeight);
		in_gl.clear(in_gl.COLOR_BUFFER_BIT | in_gl.DEPTH_BUFFER_BIT);
//		global.gl = in_gl;
		
		// TODO move this part outside the draw loop. Not needed to reset the perspective matrix every loop cycle
		mat4.perspective( currentObj.fovDeg, currentObj.aspectRatio, currentObj.nearPlane, currentObj.farPlane, currentObj.pMatrix );
		if (global.pMatrix == null){
			console.log("Initializing view and model");
			global.pMatrix = currentObj.pMatrix;
			this.refreshViewAndModel();

		}
		
		for (var i = 0; i < currentObj.modelRepo.objModels.length; i++){
			
			currentObj.modelRepo.objModels[i].draw(currentObj.pMatrix, currentObj.camera.getCameraMatrix());
			
		}
		
		
		var mMatrix = currentObj.modelRepo.objModels[0].getModelMatrix();
		
		var k,
		catalogue;
		for (k = 0; k < CatalogueRepo.catalogues.length; k++){
			catalogue = CatalogueRepo.catalogues[k];
			catalogue.draw(mMatrix);
		}
		
//		for (var i = 0; i < currentObj.modelRepo.objModels.length; i++){
//			
//			currentObj.modelRepo.objModels[i].enableShader(currentObj.pMatrix, currentObj.camera.getCameraMatrix());
//			
//		}

//		currentObj.xyzRefSystemObj.draw(currentObj.pMatrix, currentObj.camera.getCameraMatrix());
	};
	
	
	
	
	this.init();
}
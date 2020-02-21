/**
 * @author Fabrizio Giordano (Fab)
 */


function RayPickingUtils(){
	
	var RayPickingUtilsObj = this;

	this.init = function(){
		
		RayPickingUtilsObj.nearestVisibleObjectIdx = -1;
		
	};
	
	this.getRayFromMouse =  function(in_mouseX, in_mouseY, in_projectionMatrix, in_cameraMatrix, in_gl_canvas ) {
		
		var rect = in_gl_canvas.getBoundingClientRect();
		
		var canvasMX = in_mouseX - rect.left;
		var canvasMY = in_mouseY - rect.top;
		
//		console.log("[RayPickingUtils::getRayFromMouse] in_mouseX, in_mouseY "+ in_mouseX+","+ in_mouseY);
//		console.log("[RayPickingUtils::getRayFromMouse] canvasMX, canvasMY "+ canvasMX+","+ canvasMY);
		
		var x = ( 2.0 * canvasMX ) / in_gl_canvas.clientWidth - 1.0;
		var y = 1.0 - ( 2.0 * canvasMY ) / in_gl_canvas.clientHeight;
		var z = 1.0;

		// normalized device space
		var rayNds = vec3.create([x, y, z]);
		
		// homogeneous clip space
		var rayClip = [rayNds[0], rayNds[1], -1.0, 1.0];
		
		// eye space
		var pMatrixInverse = mat4.create();
		mat4.identity(pMatrixInverse);
		mat4.inverse(in_projectionMatrix, pMatrixInverse);
		var rayEye = [];
		mat4.multiplyVec4(pMatrixInverse, rayClip, rayEye);
		rayEye = [rayEye[0], rayEye[1], -1.0, 0.0];
		
//		console.log("[RayPickingUtils::getRayFromMouse] rayEye "+rayEye);
		
		// world space
		var rayWorld = [];
		var vMatrixInverse = mat4.create();
		mat4.identity(vMatrixInverse);
		mat4.inverse(in_cameraMatrix, vMatrixInverse);
		mat4.multiplyVec4(vMatrixInverse, rayEye, rayWorld);
		
//		console.log("[RayPickingUtils::getRayFromMouse] rayWorld "+rayWorld);
		
		vec3.normalize(rayWorld, rayWorld);
		
//		console.log("[RayPickingUtils::getRayFromMouse] rayWorld normalized  "+rayWorld);
		
		return rayWorld;
		
	};
	
	
	/*
	 * antongerdelan.net/opengl/raycasting.html
	 */
	this.raySphere = function (rayOrigWorld, rayDirectionWorld, model){
		
//		console.log("[RayPickingUtils::raySphere] rayOrigWorld "+rayOrigWorld);
//		console.log("[RayPickingUtils::raySphere] rayDirectionWorld "+rayDirectionWorld);
//		console.log("[RayPickingUtils::raySphere] model "+JSON.stringify(model));
		
		
		var intersectionDistance = -1;
		var distToMoldel = vec3.create();
		vec3.subtract(rayOrigWorld, model.center, distToMoldel);
//		console.log("[RayPickingUtils::raySphere] distToMoldel "+distToMoldel);
		
		var b = vec3.dot(rayDirectionWorld, distToMoldel);
//		console.log("[RayPickingUtils::raySphere] b "+b);
		
		var c = vec3.dot(distToMoldel, distToMoldel) - model.radius * model.radius;
//		console.log("[RayPickingUtils::raySphere] c "+c);
		
		var bSquaredMinus_c = b * b - c;
//		console.log("[RayPickingUtils::raySphere] bSquaredMinus_c "+bSquaredMinus_c);
		
		if (bSquaredMinus_c > 0.0){
//			console.log("[RayPickingUtils::raySphere] MODEL TAKEN!!!");
			var t_a = -b + Math.sqrt(bSquaredMinus_c);
			var t_b = -b - Math.sqrt(bSquaredMinus_c);
//			console.log("t_a ->"+t_a);
//			console.log("t_b->"+t_b);
			if (t_a < 0.0){
				if (t_b < 0.0){
					console.log("[RayPickingUtils::raySphere] intersection behind your shoulder");
				}
			}else if (t_b < 0.0){
				intersectionDistance = t_a;
			}else{
				intersectionDistance = ( t_a < t_b ? t_a : t_b);
			}
		}else if (bSquaredMinus_c == 0.0){
			console.log("TAKEN (tangent)!!!");
			var t = -b + Math.sqrt(bSquaredMinus_c);
			if (t < 0.0){
				console.log("[RayPickingUtils::raySphere] intersection behind your shoulder");
			}else{
				intersectionDistance = t;
			}
		}
//		else{
//			console.log("[RayPickingUtils::raySphere] No intersection with models!!!");
//		}
		return intersectionDistance;
	};
	
	this.getNearestVisibleObjectIdx = function(){
		
		return 	RayPickingUtilsObj.nearestVisibleObjectIdx;
		
	};
	
	
	this.getIntersectionPointWithSingleModel = function(
			in_mouseX, in_mouseY, 
			in_projectionMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj){
		
		
		var rayWorld = RayPickingUtilsObj.getRayFromMouse(in_mouseX, 
				in_mouseY, 
				in_projectionMatrix, 
				in_cameraObj.getCameraMatrix(), 
				in_gl_canvas);
		
		var intersectionDistance = RayPickingUtilsObj.raySphere(
				in_cameraObj.getCameraPosition(), rayWorld, in_modelObj);
		
		var intersectionPoint = undefined;
		var intersectionModelPoint = [];
		var intersectionPoint4d;
		var pickedObject;
		
		if (intersectionDistance >= 0){
			
			intersectionPoint = vec3.create();
			vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
			vec3.add(in_cameraObj.getCameraPosition(), intersectionPoint, intersectionPoint);
			
			intersectionModelPoint = [];
			
			intersectionPoint4d = [intersectionPoint[0], intersectionPoint[1], intersectionPoint[2], 1.0];
			mat4.multiplyVec4(in_modelObj.getModelMatrixInverse(), intersectionPoint4d, intersectionModelPoint);
			
			
		}
		
		return {
			"intersectionPoint": intersectionModelPoint,
			"pickedObject": pickedObject
		};
		
	}

	
	
	this.getIntersectionPointWithModel = function(
			in_mouseX, in_mouseY, 
			in_projectionMatrix, in_cameraObj, 
			in_gl_canvas, in_modelRepoObj){
		
		var rayWorld = RayPickingUtilsObj.getRayFromMouse(in_mouseX, 
			in_mouseY, 
			in_projectionMatrix, 
			in_cameraObj.getCameraMatrix(), 
			in_gl_canvas);
		
		
		
//		RayPickingUtilsObj.nearestVisibleObjectIdx = 0;
		
		var nearestObj = RayPickingUtilsObj.getNearestObjectOnRay(
				in_mouseX, 
				in_mouseY, 
				in_projectionMatrix, 
				in_cameraObj,
				in_gl_canvas,
				in_modelRepoObj
				);
		
		
		if (DEBUG){
			console.log("[RayPickingUtils::getIntersectionPointWithModel] nearestVisibleIntersectionDistance " + nearestVisibleIntersectionDistance);
		}
		
		var intersectionPoint;
		var intersectionModelPoint = [];
		var intersectionPoint4d;
		var pickedObject;
		
		
//		console.log("[RayPickingUtils::getIntersectionPointWithModel] in_modelRepoObj.objModels[nearestObj.idx] "+ 
//		JSON.stringify(in_modelRepoObj.objModels[nearestObj.idx]));
		
		if (nearestObj.distance >= 0){
			
			var pickedObject = in_modelRepoObj.objModels[nearestObj.idx];
			
//			intersectionPoint = vec3.create();
//			vec3.scale(rayWorld, nearestObj.distance, intersectionPoint);
//			vec3.add(in_cameraObj.getCameraPosition(), intersectionPoint, intersectionPoint);
//			
//			intersectionModelPoint = [];
//			
//			intersectionPoint4d = [intersectionPoint[0], intersectionPoint[1], intersectionPoint[2], 1.0];
//			mat4.multiplyVec4(pickedObject.getModelMatrixInverse(), intersectionPoint4d, intersectionModelPoint);
			
			intersectionModelPoint = RayPickingUtilsObj.getIntersectionPointWithSingleModel(
					in_mouseX, in_mouseY, 
					in_projectionMatrix, in_cameraObj, 
					in_gl_canvas, pickedObject);
//			console.log("[RayPickingUtils::getIntersectionPointWithModel] intersectionModelPoint "+JSON.stringify(intersectionModelPoint));
			
		}
		
		return {
			"intersectionPoint": intersectionModelPoint,
			"pickedObject": pickedObject
		};
		
	};
	
	
	this.getNearestObjectOnRay = function(in_mouseX, in_mouseY,  
			in_pMatrix, in_cameraObj, in_gl_canvas, in_modelRepoObj){
		
		document.getElementsByTagName("body")[0].style.cursor = "auto";

//		// TODO move in into FVPresenter beffore call this method
//		currentObj.mouseDown = false; 
//		currentObj.lastMouseX = mouseX;
//		currentObj.lastMouseY = mouseY;
		
		var intersectionDistance = -1;
		var nearestVisibleObjectIdx = -1;
		var currModel;
		var nearestVisibleIntersectionDistance = undefined;
		
		var rayWorld = RayPickingUtilsObj.getRayFromMouse(in_mouseX, 
				in_mouseY, 
				in_pMatrix, 
				in_cameraObj.getCameraMatrix(), 
				in_gl_canvas);
		if (DEBUG){
			console.log("[RayPickingUtils::getNearestObjectOnRay] rayWorld "+rayWorld);
			console.log("[RayPickingUtils::getNearestObjectOnRay] in_mouseX "+in_mouseX);
			console.log("[RayPickingUtils::getNearestObjectOnRay] in_mouseY "+in_mouseY);
			console.log("[RayPickingUtils::getNearestObjectOnRay] in_pMatrix "+in_pMatrix);
			console.log("[RayPickingUtils::getNearestObjectOnRay] in_cameraObj.getCameraMatrix() "+in_cameraObj.getCameraMatrix());
			console.log("[RayPickingUtils::getNearestObjectOnRay] in_gl_canvas "+in_gl_canvas);
		}
		
		for (var i = 0; i < in_modelRepoObj.objModels.length; i++){
			
			currModel = in_modelRepoObj.objModels[i];
			console.log("[RayPickingUtils::getNearestObjectOnRay] checking model "+currModel.name + " having index "+i+" in modelRepo");
			
			intersectionDistance = RayPickingUtilsObj.raySphere(
					in_cameraObj.getCameraPosition(), rayWorld, currModel);
//			if (DEBUG){
//				console.log("[RayPickingUtils::getNearestObjectOnRay] intersectionDistance "+intersectionDistance + " object "+currModel.name);
//			}
			if (intersectionDistance >= 0){
				if (nearestVisibleIntersectionDistance === undefined || intersectionDistance < nearestVisibleIntersectionDistance){
					nearestVisibleIntersectionDistance = intersectionDistance;
					nearestVisibleObjectIdx = i;
				}
			}
		}
		if (nearestVisibleIntersectionDistance >= 0){
			if (DEBUG){
				console.log("[RayPickingUtils]::getNearestObjectOnRay nearest object name "+currModel.name);
				
			}
//			return nearestVisibleIntersectionDistance;
		}
		RayPickingUtilsObj.nearestVisibleObjectIdx = nearestVisibleObjectIdx;
//		console.log("[RayPickingUtils::getNearestObjectOnRay] nearestVisibleObjectIdx "+nearestVisibleObjectIdx);
//		console.log("[RayPickingUtils::getNearestObjectOnRay] nearestVisibleIntersectionDistance "+nearestVisibleIntersectionDistance);
		
//		console.log("[RayPickingUtils]::getNearestObjectOnRay nearestVisibleObjectIdx "+nearestVisibleObjectIdx);
//		console.log("[RayPickingUtils]::getNearestObjectOnRay nearestVisibleIntersectionDistance "+nearestVisibleIntersectionDistance);
		
		return {
			"idx": nearestVisibleObjectIdx,
			"distance": nearestVisibleIntersectionDistance
		};
	};
	
	this.init();
}




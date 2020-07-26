"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */

class RayPickingUtils{
	
	// N.B. ECMAScript 6 private field definition. Not recognized by Eclipse at the moment 
	static #nearestVisibleObjectIdx = -1;
	
	
	constructor(){}
	
	
	static getRayFromMouse (in_mouseX, in_mouseY) {
		
		var vMatrix = global.camera.getCameraMatrix();
		var gl = global.gl;
		var pMatrix = global.pMatrix;
		
		var rect = gl.canvas.getBoundingClientRect();
		
		var canvasMX = in_mouseX - rect.left;
		var canvasMY = in_mouseY - rect.top;
		
		var x = ( 2.0 * canvasMX ) / gl.canvas.clientWidth - 1.0;
		var y = 1.0 - ( 2.0 * canvasMY ) / gl.canvas.clientHeight;
		var z = 1.0;

		// normalized device space
		var rayNds = vec3.create([x, y, z]);
		
		// homogeneous clip space
		var rayClip = [rayNds[0], rayNds[1], -1.0, 1.0];
		
		// eye space
		var pMatrixInverse = mat4.create();
		mat4.identity(pMatrixInverse);
		mat4.inverse(pMatrix, pMatrixInverse);
		var rayEye = [];
		mat4.multiplyVec4(pMatrixInverse, rayClip, rayEye);
		rayEye = [rayEye[0], rayEye[1], -1.0, 0.0];
		
		// world space
		var rayWorld = [];
		var vMatrixInverse = mat4.create();
		mat4.identity(vMatrixInverse);
		mat4.inverse(vMatrix, vMatrixInverse);
		mat4.multiplyVec4(vMatrixInverse, rayEye, rayWorld);
				
		vec3.normalize(rayWorld, rayWorld);
		
		return rayWorld;
		
	}
	
	
	/*
	 * antongerdelan.net/opengl/raycasting.html
	 */
	static raySphere (rayOrigWorld, rayDirectionWorld, in_model = null){
//		static raySphere (rayOrigWorld, rayDirectionWorld, model){
		
//		console.log(rayOrigWorld);
		
		if (in_model == null){
			in_model = global.model;
		} 
		
		var intersectionDistance = -1;
		var distToMoldel = vec3.create();
		vec3.subtract(rayOrigWorld, in_model.center, distToMoldel);
		
		var b = vec3.dot(rayDirectionWorld, distToMoldel);
		
		var c = vec3.dot(distToMoldel, distToMoldel) - in_model.radius * in_model.radius;
		
		var bSquaredMinus_c = b * b - c;
		
		if (bSquaredMinus_c > 0.0){

			var t_a = -b + Math.sqrt(bSquaredMinus_c);
			var t_b = -b - Math.sqrt(bSquaredMinus_c);

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
		return intersectionDistance;
	}
	
	static getNearestVisibleObjectIdx(){
		
		return 	this.#nearestVisibleObjectIdx;
		
	}
	
	
	
	
	
	// TODO pass only matrices
	/**
	 * 
	 * if intersection:
	 * 	returns vec3 as intersectionPoint,
	 * else
	 * 	 returns undefned as intersectionPoint,
	 */
	static getIntersectionPointWithSingleModel(in_mouseX, in_mouseY, in_modelObj = null){
		
		var camera = global.camera;
		
		if (in_modelObj == null){
			in_modelObj = global.model;
		}
		
		// TODO it has been already computed in getIntersectionPointWithModel
		var rayWorld = RayPickingUtils.getRayFromMouse(in_mouseX, in_mouseY);
		
		var intersectionDistance = RayPickingUtils.raySphere(camera.getCameraPosition(), rayWorld, in_modelObj);
		
		var intersectionPoint = [],
		intersectionModelPoint = [];
		var intersectionPoint4d;
		var pickedObject = in_modelObj; //TODO check if this is needed
		
		if (intersectionDistance >= 0){
			
			intersectionPoint = vec3.create();
			vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
			vec3.add(camera.getCameraPosition(), intersectionPoint, intersectionPoint);

			intersectionPoint4d = [intersectionPoint[0], intersectionPoint[1], intersectionPoint[2], 1.0];
			mat4.multiplyVec4(in_modelObj.getModelMatrixInverse(), intersectionPoint4d, intersectionModelPoint);
			
			
		}
		
		return {
			"intersectionPoint": intersectionModelPoint,
			"pickedObject": pickedObject
		};
		
	}

	
	
	static getIntersectionPointWithModel(in_mouseX, in_mouseY, in_modelRepoObj){

		
		var nearestObj = RayPickingUtils.getNearestObjectOnRay(in_mouseX, in_mouseY, in_modelRepoObj);
		
		if (DEBUG){
			console.log("[RayPickingUtils::getIntersectionPointWithModel] nearestVisibleIntersectionDistance " + nearestVisibleIntersectionDistance);
		}
		
		var intersectionModelPoint = [];
		var pickedObject;

		if (nearestObj.distance >= 0){
			
			var pickedObject = in_modelRepoObj.objModels[nearestObj.idx];
			
			
			intersectionModelPoint = RayPickingUtils.getIntersectionPointWithSingleModel(in_mouseX, in_mouseY, pickedObject);
			
		}
		
		return {
			"intersectionPoint": intersectionModelPoint,
			"pickedObject": pickedObject
		};
		
	}
	
	
	static getNearestObjectOnRay (in_mouseX, in_mouseY, in_modelRepoObj){
		
		var camera = global.camera;
		
		document.getElementsByTagName("body")[0].style.cursor = "auto";
		
		var intersectionDistance = -1;
		var nearestVisibleObjectIdx = -1;
		var currModel;
		var nearestVisibleIntersectionDistance = undefined;
		
		var rayWorld = RayPickingUtils.getRayFromMouse(in_mouseX, in_mouseY);

		for (var i = 0; i < in_modelRepoObj.objModels.length; i++){

			currModel = in_modelRepoObj.objModels[i];
				
			intersectionDistance = RayPickingUtils.raySphere(camera.getCameraPosition(), rayWorld, currModel);

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
		}
		this.#nearestVisibleObjectIdx = nearestVisibleObjectIdx;
		
		return {
			"idx": nearestVisibleObjectIdx,
			"distance": nearestVisibleIntersectionDistance
		};
	}
	
	
}





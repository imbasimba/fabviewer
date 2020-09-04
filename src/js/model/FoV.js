"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
import RayPickingUtils from '../utils/RayPickingUtils';
import {radToDeg} from '../utils/Utils';
import {vec3, mat4} from 'gl-matrix';
class FoV{
	
	#fovX_deg;
	#fovY_deg;
	#minFoV;
	#prevMinFoV;
	#model;
	
	constructor(in_model){
		this.#fovX_deg = 180;
		this.#fovY_deg = 180;
		this.#minFoV = 180;
		this.#prevMinFoV = 180;
		this.#model = in_model;
	}
	
	getFoV(){
		
		
		var gl = global.gl;
		
		this.#prevMinFoV = this.#minFoV;
		
		// horizontal FoV 
		this.#fovX_deg = this.computeAngle(0, gl.canvas.height / 2);
		// vertical FoV 
		this.#fovY_deg = this.computeAngle(gl.canvas.width / 2, 0);

		this.#minFoV = this.minFoV;
		
		return this;
	}
	
	get fovXDeg(){
		return this.#fovX_deg;
	}
	
	get fovYDeg(){
		return this.#fovY_deg;
	}
	
	computeAngle(canvasX, canvasY){
		
		var pMatrix = global.pMatrix;
		var camera = global.camera;
		var gl = global.gl;
		
		var rayWorld = RayPickingUtils.getRayFromMouse(canvasX, canvasY);
		
		var intersectionDistance = RayPickingUtils.raySphere(camera.getCameraPosition(), rayWorld, this.#model);
		
		if (intersectionDistance > 0){
			var intersectionPoint = vec3.create();
			vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
			vec3.add(camera.getCameraPosition(), intersectionPoint, intersectionPoint);
			
			var center = this.#model.center;
			
			var intersectionPoint_center_vector = vec3.create();
			vec3.subtract(intersectionPoint, center, intersectionPoint_center_vector);
			
			
			// error found!!!!! when the camera is rotated, the following vector should be rotated as well
			// because the z-axis of the world doesn't coincide with the z-axis of the camera anymore 
			var b = vec3.create( [this.#model.center[0], this.#model.center[1], this.#model.center[2] + this.#model.radius] );
			
			var vMatrixInverse = mat4.create();
			mat4.identity(vMatrixInverse);
			mat4.invert(vMatrixInverse, camera.getCameraMatrix());
			
			// mat4.multiplyVec3(vMatrixInverse, b, b);
			
			
			
			var b_center_vector = vec3.create();
			vec3.subtract(b, center, b_center_vector);
			
			var scal_prod = vec3.create();
			scal_prod = vec3.dot(intersectionPoint_center_vector, b_center_vector);
			var intersectionPoint_center_vector_norm = Math.sqrt(
					intersectionPoint_center_vector[0]*intersectionPoint_center_vector[0] + 
					intersectionPoint_center_vector[1]*intersectionPoint_center_vector[1] + 
					intersectionPoint_center_vector[2]*intersectionPoint_center_vector[2]);
			var b_center_vector_norm = Math.sqrt(
					b_center_vector[0]*b_center_vector[0] + 
					b_center_vector[1]*b_center_vector[1] + 
					b_center_vector[2]*b_center_vector[2]);
			var cos_angle = scal_prod / (intersectionPoint_center_vector_norm * b_center_vector_norm);
			var angle_rad = Math.acos(cos_angle);
			var angle_deg = 2 * radToDeg(angle_rad);
			
		}else{
			angle_deg = 180;
		}
		return angle_deg;
	}
	
	get minFoV(){
		this.#minFoV = (this.#fovY_deg <= this.#fovX_deg) ? this.#fovY_deg : this.#fovX_deg;
		return this.#minFoV;
	}
	
}

export default FoV;

//function FoV(in_gl, in_canvas, in_model){
//	
//	var currentObj = this;
//	
//	this.init = function(){
//		currentObj.fovX_deg = 180;
//		currentObj.fovY_deg = 180;
//		currentObj.minFoV = 180;
//	};
//	
//	
//	
//
//	this.getFoV = function (in_pMatrix, in_camera){
//
//		function computeAngle(canvasX, canvasY, in_pMatrix, in_camera){
//			 
//			var rayWorld = RayPickingUtils.getRayFromMouse(canvasX, canvasY, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
//			
//			var intersectionDistance = RayPickingUtils.raySphere(in_camera.getCameraPosition(), rayWorld, in_model);
//			
//			if (intersectionDistance > 0){
//				var intersectionPoint = vec3.create();
//				vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
//				vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
//				
//				var center = in_model.center;
//				
//				var intersectionPoint_center_vector = vec3.create();
//				vec3.subtract(intersectionPoint, center, intersectionPoint_center_vector);
//				
//				
//				// error found!!!!! when the camera is rotated, the following vector should be rotated as well
//				// because the z-axis of the world doesn't coincide with the z-axis of the camera anymore 
//				var b = vec3.create( [in_model.center[0], in_model.center[1], in_model.center[2] + in_model.radius] );
//				
//				var vMatrixInverse = mat4.create();
//				mat4.identity(vMatrixInverse);
//				mat4.inverse(in_camera.getCameraMatrix(), vMatrixInverse);
//				
//				mat4.multiplyVec3(vMatrixInverse, b, b);
//				
//				
//				
//				var b_center_vector = vec3.create();
//				vec3.subtract(b, center, b_center_vector);
//				
//				var scal_prod = vec3.create();
//				scal_prod = vec3.dot(intersectionPoint_center_vector, b_center_vector);
//				var intersectionPoint_center_vector_norm = Math.sqrt(
//						intersectionPoint_center_vector[0]*intersectionPoint_center_vector[0] + 
//						intersectionPoint_center_vector[1]*intersectionPoint_center_vector[1] + 
//						intersectionPoint_center_vector[2]*intersectionPoint_center_vector[2]);
//				var b_center_vector_norm = Math.sqrt(
//						b_center_vector[0]*b_center_vector[0] + 
//						b_center_vector[1]*b_center_vector[1] + 
//						b_center_vector[2]*b_center_vector[2]);
//				var cos_angle = scal_prod / (intersectionPoint_center_vector_norm * b_center_vector_norm);
//				var angle_rad = Math.acos(cos_angle);
//				var angle_deg = 2 * radToDeg(angle_rad);
//				
//			}else{
//				angle_deg = 180;
//			}
//			return angle_deg;
//		}
//		
//		currentObj.prevMinFoV = currentObj.minFoV;
//		
//		// horizontal FoV 
//		currentObj.fovX_deg = computeAngle(0, in_canvas.height / 2, in_pMatrix, in_camera);
//		// vertical FoV 
//		currentObj.fovY_deg = computeAngle(in_canvas.width / 2, 0, in_pMatrix, in_camera);
//
//		currentObj.minFoV = currentObj.getMinFoV();
//		
//		return currentObj;
//
//	};
//	
//	this.getMinFoV = function(){
//		currentObj.minFoV = (currentObj.fovY_deg <= currentObj.fovX_deg) ? currentObj.fovY_deg : currentObj.fovX_deg;
//		return currentObj.minFoV;
//	};
//	
//	this.init();
//	
//	
//}
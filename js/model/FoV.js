/**
 * @author Fabrizio Giordano (Fab)
 */
function FoV(in_gl, in_canvas, in_model, in_raypicker){
	
	var currentObj = this;
	
	this.init = function(){
		currentObj.fovX_deg = 180;
		currentObj.fovY_deg = 180;
		currentObj.minFoV = 180;
		currentObj.raypicker = new RayPickingUtils();
	};
	
	
	

	this.getFoV = function (in_pMatrix, in_camera){

		function computeAngle(canvasX, canvasY, in_pMatrix, in_camera){
			 
			var rayWorld = currentObj.raypicker.getRayFromMouse(canvasX, canvasY, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
			
			var intersectionDistance = currentObj.raypicker.raySphere(in_camera.getCameraPosition(), rayWorld, in_model);
			
			if (intersectionDistance > 0){
				var intersectionPoint = vec3.create();
				vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
				vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
				
				var center = in_model.center;
				
				var intersectionPoint_center_vector = vec3.create();
				vec3.subtract(intersectionPoint, center, intersectionPoint_center_vector);
				
				
				// error found!!!!! when the camera is rotated, the following vector should be rotated as well
				// because the z-axis of the world doesn't coincide with the z-axis of the camera anymore 
				var b = vec3.create( [in_model.center[0], in_model.center[1], in_model.center[2] + in_model.radius] );
				
				var vMatrixInverse = mat4.create();
				mat4.identity(vMatrixInverse);
				mat4.inverse(in_camera.getCameraMatrix(), vMatrixInverse);
				
				mat4.multiplyVec3(vMatrixInverse, b, b);
				
				
				
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
		
		currentObj.prevMinFoV = currentObj.minFoV;
		
		// horizontal FoV 
		currentObj.fovX_deg = computeAngle(0, in_canvas.height / 2, in_pMatrix, in_camera);
		// vertical FoV 
		currentObj.fovY_deg = computeAngle(in_canvas.width / 2, 0, in_pMatrix, in_camera);

		currentObj.minFoV = currentObj.getMinFoV();
		
		return currentObj;

	};
	
	this.getMinFoV = function(){
		currentObj.minFoV = (currentObj.fovY_deg <= currentObj.fovX_deg) ? currentObj.fovY_deg : currentObj.fovX_deg;
		return currentObj.minFoV;
	};
	
	this.init();
	
	
}

/**
 * @author Fabrizio Giordano (Fab)
 */

function FoVUtils(){

	var currentObj = this;
	

	this.init = function(){
		currentObj.fovX_deg = 180;
		currentObj.fovY_deg = 180;

	};
	
	
	this.computeAngle = function(canvasX, canvasY, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker){
		 
		var rayWorld = in_raypicker.getRayFromMouse(canvasX, canvasY, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
		
		var intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), rayWorld, in_model);
		console.log("[FoVUtils::computeAngle] intersectionDistance "+intersectionDistance + "against object "+in_model.name);
		if (intersectionDistance > 0){
			var intersectionPoint = vec3.create();
			vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
			vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
			
			var center = in_model.center;
			
			var intersectionPoint_center_vector = vec3.create();
			vec3.subtract(intersectionPoint, center, intersectionPoint_center_vector);
			
			var b = vec3.create( [in_model.center[0], in_model.center[1], in_model.center[2] + in_model.radius] );
			
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
	};

	this.getFoV = function (in_canvas, in_pMatrix, in_camera, in_model, in_raypicker){

		// horizontal FoV 
		currentObj.fovX_deg = currentObj.computeAngle(0, in_canvas.height / 2, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker);
		// vertical FoV 
		currentObj.fovY_deg = currentObj.computeAngle(in_canvas.width / 2, 0, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker);
				
		return [currentObj.fovX_deg, currentObj.fovY_deg];

	};
	
	

	
	this.getMinFoV = function(){
		return (currentObj.fovY_deg <= currentObj.fovX_deg) ? currentObj.fovY_deg : currentObj.fovX_deg;
	};
	
	this.init();
}



FoVUtils.getFoVPolygon3 = function(in_pMatrix, in_vMatrix, in_mMatrix){
	
	// 1. compute plane A, B, C, D from perspective matrix
	// 2. translate center of sphere the inverse of view matrix tranlsation column
	// 3. do the math and compute circle center
	// 4. compute circle radius r and distance d = x_c - x_s 
	// 5. given that Y is the up axis, P_left = [x_c - r, d, 0 o z_s?], P_rigth = [x_c + r, d, 0 o z_s?] 
	
	
	var M = mat4.create();
//	mat4.identity(M);
//	mat4.multiply(in_vMatrix, in_mMatrix, M);
	
	M = in_vMatrix;
	
	// matrices in column-major order
	var A = M[3] - M[1];		// A = m41 - m21
	var B = M[7] - M[5];		// B = m42 - m22
	var C = M[11] - M[9];		// C = m43 - m23
	var D = M[15] - M[13];	// D = m44 - m24
	
//	var mMatrix_inverse = mat4.create();
//	mat4.identity(mMatrix_inverse);
//	mat4.inverse(in_mMatrix, mMatrix_inverse );
//	x_s_m = mMatrix_inverse[12];
//	y_s_m = mMatrix_inverse[13];
//	z_s_m = mMatrix_inverse[14];
	
//	var MMatrix_inverse = mat4.create();
//	mat4.identity(MMatrix_inverse);
//	mat4.inverse(M, MMatrix_inverse );
//	x_s_M = MMatrix_inverse[12];
//	y_s_M = MMatrix_inverse[13];
//	z_s_M = MMatrix_inverse[14];
	
//	var vMatrix_inverse = mat4.create();
//	mat4.identity(vMatrix_inverse);
//	mat4.inverse(in_vMatrix, vMatrix_inverse );
//	x_s = vMatrix_inverse[12];
//	y_s = vMatrix_inverse[13];
//	z_s = vMatrix_inverse[14];
	
	x_s = y_s = z_s = 0;
	
	var R_s = 1;
	var x_c = x_s - (A * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var y_c = y_s - (B * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var z_c = z_s - (C * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var d = Math.abs(A * x_s + B * y_s + C * z_s + D) / Math.sqrt( A * A + B * B + C * C);
	
	var P_right = null;
	var P_left = null;
	if (R_s > d){	// center of circle inside the sphere
		var r = Math.sqrt( R_s * R_s - ( d * d ) );
		
		
		
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}else if ( R_s == d){	// center of circle tangent to the sphere
		r = 0;
		
		
		
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}else{	// center of circle outside the sphere 
		console.log("Top frustum plane not intersecting the sphere");
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}
	
};




FoVUtils.getFoVPolygon2 = function(in_pMatrix, in_vMatrix, in_mMatrix){
	
	 
		
	var pMatrix_inverse = mat4.create();
	mat4.identity(pMatrix_inverse);
	mat4.inverse(in_pMatrix, pMatrix_inverse );
	
	var vMatrix_inverse = mat4.create();
	mat4.identity(vMatrix_inverse);
	mat4.inverse(in_vMatrix, vMatrix_inverse );
	
	var mMatrix_inverse = mat4.create();
	mat4.identity(mMatrix_inverse);
	mat4.inverse(in_mMatrix, mMatrix_inverse );
	
	
	
	
	var v_translation = mat4.create();
	mat4.identity(v_translation);
	v_translation[12] = vMatrix_inverse[12];
	v_translation[13] = vMatrix_inverse[13];
	v_translation[14] = vMatrix_inverse[14];
	
	var vm = mat4.create();
	mat4.identity(vm);
	mat4.multiply(v_translation, mMatrix_inverse, vm);
	
	var pvm = mat4.create();
	mat4.identity(pvm);
	mat4.multiply(pMatrix_inverse, vm, pvm);
	
	
	// matrices in column-major order
	var A = pvm[3] - pvm[1];		// A = m41 - m21
	var B = pvm[7] - pvm[5];		// B = m42 - m22
	var C = pvm[11] - pvm[9];		// C = m43 - m23
	var D = pvm[15] - pvm[13];	// D = m44 - m24
	
	// matrices in row-major order
//	var A = in_pMatrix[12] - in_pMatrix[4];		// A = m41 - m21
//	var B = in_pMatrix[13] - in_pMatrix[5];		// B = m42 - m22
//	var C = in_pMatrix[14] - in_pMatrix[6];		// C = m43 - m23
//	var D = in_pMatrix[15] - in_pMatrix[7];		// D = m44 - m24
	
	var x_s = y_s = z_s = 0;
	var R_s = 1;
	var x_c = x_s - (A * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var y_c = y_s - (B * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var z_c = z_s - (C * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var d = Math.abs(A * x_s + B * y_s + C * z_s + D) / Math.sqrt( A * A + B * B + C * C);
	
	var P_right = null;
	var P_left = null;
	if (R_s > d){
		var r = Math.sqrt( R_s * R_s - ( d * d ) );
		
		P_right = [0, y_c + r, z_c + d];
		P_left = [0, y_c - r, z_c + d];
		
		
		var v_rotation = vMatrix_inverse;
		v_rotation[12] = 0;
		v_rotation[13] = 0;
		v_rotation[14] = 0;
		mat4.multiplyVec3(v_rotation, P_left);
		mat4.multiplyVec3(v_rotation, P_right);
		
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}else if ( R_s == d){
		r = 0;
		
		P_right = [0, y_c + r, z_c + d];
		P_left = [0, y_c - r, z_c + d];
		
		
		var v_rotation = vMatrix_inverse;
		v_rotation[12] = 0;
		v_rotation[13] = 0;
		v_rotation[14] = 0;
		mat4.multiplyVec3(v_rotation, P_left);
		mat4.multiplyVec3(v_rotation, P_right);
		
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}else{
		console.log("Top frustum plane not intersecting the sphere");
		return {
			"P_left" : P_left,
			"P_right" : P_right
		}
	}
	
	
	
//	var P_right_model = vec3.create();
//	mat4.multiplyVec3(in_mMatrix, P_right, P_right_model);
//	var P_right_view = vec3.create();
//	mat4.multiplyVec3(in_mMatrix, P_right_model, P_right_view);
//	P_right = P_right_view;
//	
//	var P_left_model = vec3.create();
//	mat4.multiplyVec3(in_mMatrix, P_left, P_left_model);
//	var P_left_view = vec3.create();
//	mat4.multiplyVec3(in_mMatrix, P_left_model, P_left_view);
//	P_left = P_left_view;
	
	
	
	
};

FoVUtils.getFoVPolygon = function(canvasX, canvasY, in_pMatrix, in_camera, in_model, in_canvas, in_raypicker){
	
	var alongY = [];
	
	var y_middle = in_raypicker.getRayFromMouse(0, canvasY/2, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
	var intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), y_middle, in_model);
	if (intersectionDistance > 0){
		var intersectionPoint = vec3.create();
		vec3.scale(y_middle, intersectionDistance, intersectionPoint);
		vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
		alongY.push(intersectionPoint);
	}
	
	
	
	var top = in_raypicker.getRayFromMouse(0, 0, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
	var top_intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), top, in_model);
	if (intersectionDistance > 0){
		var intersectionPoint = vec3.create();
		vec3.scale(top, top_intersectionDistance, intersectionPoint);
		vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
		alongY.push(intersectionPoint);
	}
	
	
	
	
	if (top_intersectionDistance < 0){
		for (var i = 2; i <= 16; i = i *2){
			var rayWorld = in_raypicker.getRayFromMouse(0, canvasY/2 * 1/i, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
			
			var intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), rayWorld, in_model);
			console.log("[FoVUtils::computeAngle] intersectionDistance "+intersectionDistance + "against object "+in_model.name);
			if (intersectionDistance > 0){
				var intersectionPoint = vec3.create();
				vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
				vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
				alongY.push(intersectionPoint);
			}else{
				break;
			}
		}
	}
	
	
	
	
	
	var x_middle = in_raypicker.getRayFromMouse(canvasX/2, 0, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
	var intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), x_middle, in_model);
	if (intersectionDistance > 0){
		var intersectionPoint = vec3.create();
		vec3.scale(x_middle, intersectionDistance, intersectionPoint);
		vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
		alongY.push(intersectionPoint);
	}
	
	
	
	
	
	if (top_intersectionDistance < 0){
		for (var i = 2; i <= 16; i = i *2){
			var rayWorld = in_raypicker.getRayFromMouse(canvasX/2 * 1/i, 0, in_pMatrix, in_camera.getCameraMatrix(), in_canvas);
			
			var intersectionDistance = in_raypicker.raySphere(in_camera.getCameraPosition(), rayWorld, in_model);
			console.log("[FoVUtils::computeAngle] intersectionDistance "+intersectionDistance + "against object "+in_model.name);
			if (intersectionDistance > 0){
				var intersectionPoint = vec3.create();
				vec3.scale(rayWorld, intersectionDistance, intersectionPoint);
				vec3.add(in_camera.getCameraPosition(), intersectionPoint, intersectionPoint);
				alongY.push(intersectionPoint);
			}else{
				break;
			}
		}
	}
	
	
	
	
	
	return alongY;
	
	
};




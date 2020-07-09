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

FoVUtils.getFoVPolygon = function(in_pMatrix, in_vMatrix, in_mMatrix){
	
	// matrices in column-major order
	var M = mat4.create();
//	var mM_inverse = mat4.inverse(in_mMatrix, mM_inverse);
//	var vM_inverse = mat4.inverse(in_vMatrix, vM_inverse);
//	var pM_inverse = mat4.inverse(in_pMatrix, pM_inverse);
//
//	M = mat4.multiply(vM_inverse, mM_inverse, M);
//	M = mat4.multiply(pM_inverse, M, M);

	
	M = mat4.multiply(in_vMatrix, in_mMatrix, M);
	M = mat4.multiply(in_pMatrix, M, M);
	
	
	// top plane normal
	// A = m41 - m21
	// B = m42 - m22
	// C = m43 - m23
	// D = m44 - m24
	var A, B, C, D;
	A = M[3] - M[1];
	B = M[7] - M[5];
	C = M[11] - M[9];
	D = M[15] - M[13];
	var normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//	var topPlaneNormal = [M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13]];
	var topPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
	
	
	// bottom plane normal
	// A = m41 + m21
	// B = m42 + m22
	// C = m43 + m23
	// D = m44 + m24 
	A = M[3] + M[1];
	B = M[7] + M[5];
	C = M[11] + M[9];
	D = M[15] + M[13];
	normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//	var bottomPlaneNormal = [M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13]];
	var bottomPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
	
	// right plane normal
	// A = m41 - m11
	// B = m42 - m12
	// C = m43 - m13
	// D = m44 - m14
	A = M[3] - M[0];
	B = M[7] - M[4];
	C = M[11] - M[8];
	D = M[15] - M[12];
	normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//	var rightPlaneNormal = [M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12]];
	var rightPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
	
	
	// left plane normal
	// A = m41 + m11
	// B = m42 + m12
	// C = m43 + m13
	// D = m44 + m14
	A = M[3] + M[0];
	B = M[7] + M[4];
	C = M[11] + M[8];
	D = M[15] + M[12];
	normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//	var leftPlaneNormal = [M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12]];
	var leftPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
	
	
	var points;
	var footprint = "var aladin = A.aladin('#aladin-lite-div', {target: 'M 1', fov: 0.2});\n" +
			"var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 3});\n" +
			"aladin.addOverlay(overlay);\n" +
			"overlay.addFootprints([A.polygon([";
			
	var astroCoords = [];
	// top points
	
	points = FoVUtils.getFoVPoints(M, topPlaneNormal, leftPlaneNormal);
	astroCoords = FoVUtils.convert2Astro(points, "TOP");
	footprint += "["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
		
	// bottom points
	points = FoVUtils.getFoVPoints(M, bottomPlaneNormal, leftPlaneNormal);
	astroCoords = FoVUtils.convert2Astro(points, "BOTTOM");
	footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
	
	// left points
	points = FoVUtils.getFoVPoints(M, leftPlaneNormal, bottomPlaneNormal);
	astroCoords = FoVUtils.convert2Astro(points, "LEFT");
	footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
	
	// right points
	points = FoVUtils.getFoVPoints(M, rightPlaneNormal, bottomPlaneNormal);
	astroCoords = FoVUtils.convert2Astro(points, "RIGHT");
	footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
	
	footprint += "])])";
	
	console.log(footprint);
};


// TO BE DELETED - just for debuging
FoVUtils.convert2Astro = function(test, string){
	
	
	console.log(string+" points");
	var phiThetaDeg_left = cartesianToSpherical(test.P_1);
	var raDecDeg_left = sphericalToAstroDeg(phiThetaDeg_left.phi, phiThetaDeg_left.theta);
	console.log(raDecDeg_left);
	
	var phiThetaDeg_right = cartesianToSpherical(test.P_2);
	var raDecDeg_right = sphericalToAstroDeg(phiThetaDeg_right.phi, phiThetaDeg_right.theta);
	console.log(raDecDeg_right);
	
	return {
		"raDecDeg_1": raDecDeg_left,
		"raDecDeg_2": raDecDeg_right
	}
	
	
	
	
};

FoVUtils.getFoVPoints = function(M, plane4Sphere, plane4Circle){
	
	var A = plane4Sphere[0];
	var B = plane4Sphere[1];
	var C = plane4Sphere[2];
	var D = plane4Sphere[3]; 
	
	x_s = y_s = z_s = 0;
	
	var R_s = 1;
	var x_c = x_s - (A * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var y_c = y_s - (B * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var z_c = z_s - (C * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var d = Math.abs(A * x_s + B * y_s + C * z_s + D) / Math.sqrt( A * A + B * B + C * C);
	
	
	if (R_s > d){	// center of circle inside the sphere
		var r = Math.sqrt( R_s * R_s - ( d * d ) );
	
		A = plane4Circle[0];
		B = plane4Circle[1];
		C = plane4Circle[2];
		D = plane4Circle[3]; 
		
		var t1 = r * Math.sqrt( 1 / A*A + B*B + C*C);
		var t2 = - 1 * r * Math.sqrt( 1 / A*A + B*B + C*C);
		
		var P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
		var P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];

		
		
		
		
		return {
			"P_1" : P_1,
			"P_2" : P_2
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



FoVUtils.getFoVPolygonBK = function(in_pMatrix, in_vMatrix, in_mMatrix){
	
	// 1. compute top plane A, B, C, D from perspective matrix (normal to the plane n = Ai+Bj+Ck)
	// 2. translate center of sphere the inverse of view matrix tranlsation column
	// 3. do the math and compute circle center
	// 4. compute circle radius r and distance d = x_c - x_s using the radius R_s of the sphere 
	// 5. R_s > d means the top plane intersect the sphere
	// 5.1 compute left plane A, B, C, D
	// 
	
	
	var M = mat4.create();
	
//	M = mat4.multiply(in_pMatrix, in_vMatrix, M);
//	M = mat4.multiply(M, in_mMatrix, M);
	
	M = mat4.multiply(in_vMatrix, in_mMatrix, M);
	M = mat4.multiply(in_pMatrix, M, M);
	
	
	// matrices in column-major order
	// top plane normal
	var A = M[3] - M[1];		// A = m41 - m21
	var B = M[7] - M[5];		// B = m42 - m22
	var C = M[11] - M[9];		// C = m43 - m23
	var D = M[15] - M[13];		// D = m44 - m24 
	
	x_s = y_s = z_s = 0;
	
	var R_s = 1;
	var x_c = x_s - (A * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var y_c = y_s - (B * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var z_c = z_s - (C * (A * x_s + B * y_s + C * z_s + D) / ( A * A + B * B + C * C));
	var d = Math.abs(A * x_s + B * y_s + C * z_s + D) / Math.sqrt( A * A + B * B + C * C);
	
	
	if (R_s > d){	// center of circle inside the sphere
		var r = Math.sqrt( R_s * R_s - ( d * d ) );
		
		
		
		
		// computing left plane normal
		A = M[3] + M[0];		// A = m41 + m11
		B = M[7] + M[4];		// B = m42 + m12
		C = M[11] + M[8];		// C = m43 + m13
		D = M[15] + M[12];		// D = m44 + m14	// not needed 
		
		var t1 = r * Math.sqrt( 1 / A*A + B*B + C*C);
		var t2 = - 1 * r * Math.sqrt( 1 / A*A + B*B + C*C);
		
		var P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
		var P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];
		
//		P_1 = mat4.multiplyVec3(in_mMatrix, P_1);
//		P_2 = mat4.multiplyVec3(in_mMatrix, P_2);
		
		
		
		
		return {
			"P_1" : P_1,
			"P_2" : P_2
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











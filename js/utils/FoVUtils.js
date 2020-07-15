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


FoVUtils.getFoVPolygon = function(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker){
	/** raypicking on screen [0, 0] corner to check if HiPS covers the full screen
		if raypicking returns a valid point
			do raypicking on 4 screen corners and middle points
			return the points (8 in total)
		else
			do raypicking on screen [0, height/2]
			if raypicking returns a valid point
				compute middle top and bottom points
				compute intersection between frustrum and HiPS sphere using getFoVPolygonWithPlanes
			else
				compute intersection between frustum plane normal passing through the HiPS center
					and the HiPS (1 point).
				compute the middle point in the arc between the perpendicular plane and the point above (1 point)
				
			do raypicking on screen [0, width/2]
			if raypicking returns a valid point
				compute middle top and bottom points
				compute intersection between frustrum and HiPS sphere using getFoVPolygonWithPlanes
			else
				compute intersection between frustum plane normal passing through the HiPS center
					and the HiPS (1 point).
				compute the middle point in the arc between the perpendicular plane and the point above (1 point)
				
			
	
	*/
	
	
	
	var in_vMatrix = in_cameraObj.getCameraMatrix();
	var in_mMatrix = in_modelObj.getModelMatrix();
	var canvasWidth = in_gl_canvas.clientWidth;
	var canvasHeight = in_gl_canvas.clientHeight;
	
	var points = [];
	
	
	// Starting FIRST type of check
	var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
			0, 0, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	if (intersectionWithModel.intersectionPoint.length > 0){
		var cornersPoints = FoVUtils.getScreenCornersIntersection(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker);
//		if (cornersPoints.length == 8){

			points = cornersPoints;
//		}
	}else{
		// Starting SECOND type of check
		var M = mat4.create();
		M = mat4.multiply(in_vMatrix, in_mMatrix, M);
		M = mat4.multiply(in_pMatrix, M, M);
		
		// top plane normal
		var A, B, C, D;
		A = M[3] - M[1];	// A = m41 - m21
		B = M[7] - M[5];	// B = m42 - m22
		C = M[11] - M[9];	// C = m43 - m23
		D = M[15] - M[13];	// D = m44 - m24
		var topPlaneNormal = [M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13]];
		// bottom plane normal
		A = M[3] + M[1];	// A = m41 + m21
		B = M[7] + M[5];	// B = m42 + m22
		C = M[11] + M[9];	// C = m43 + m23
		D = M[15] + M[13];	// D = m44 + m24 
		var bottomPlaneNormal = [M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13]];
		// right plane normal
		A = M[3] - M[0];	// A = m41 - m11
		B = M[7] - M[4];	// B = m42 - m12
		C = M[11] - M[8];	// C = m43 - m13
		D = M[15] - M[12];	// D = m44 - m14
		var rightPlaneNormal = [M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12]];
		// left plane normal
		A = M[3] + M[0];	// A = m41 + m11
		B = M[7] + M[4];	// B = m42 + m12
		C = M[11] + M[8];	// C = m43 + m13
		D = M[15] + M[12];	// D = m44 + m14
		var leftPlaneNormal = [M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12]];
		
		
		
		
		// this is the case when the screen's corners do not intersect the sphere
		// testing the intersection of the top screen middle point and the sphere 
		var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
				canvasWidth/2, 0, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		var singlePoint_tb = false;
		if (intersectionWithModel.intersectionPoint.length > 0){
			// TOP and BOTTOM frustum points
			var topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
			var bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
		}else{
			singlePoint_tb = true;
			// TOP and BOTTOM normal projections
			var topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
			var bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
		}
		
		
		var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
				0, canvasHeight/2, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		var singlePoint_lr = false;
		if (intersectionWithModel.intersectionPoint.length > 0){
			// LEFT and RIGHT frustum points
			var leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
			var rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
		}else{
			singlePoint_lr = true;
			// LEFT and RIGHT normal projections
			var leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
			var rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
		}
		
		for (var i = 0; i < topPoints.length; i++){
			points.push(topPoints[i]);	
		}
		for (var i = 0; i < rightPoints.length; i++){
			points.push(rightPoints[i]);	
		}
		for (var i = 0; i < bottomPoints.length; i++){
			points.push(bottomPoints[i]);	
		}
		for (var i = 0; i < leftPoints.length; i++){
			points.push(leftPoints[i]);	
		}
		
		
		if (singlePoint_lr || singlePoint_tb){
			// TODO compute intermidiate arc points
		}
		
	}
	
	
	
	
	
	
	// convert points from model coords to astro coords
	var phiThetaDeg;
	var raDecDeg = [];
	
	for (var i = 0; i < points.length; i++){
		phiThetaDeg = cartesianToSpherical(points[i]);
		raDecDeg.push(sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta));	
	}
	
	
	
	
	return raDecDeg;
	
};


/** 
 * by  using raypicking, it computes the intersection points between the HiPS sphere and the corners and middle points 
 * of the screen:
 * top:		(0,0), (canvasWidth/2,0), (canvasWidth,0)
 * right:	(canvasWidth, canvasHeight/2)
 * bottom:	(canvasWidth,canvasHeight), (canvasWidth/2,canvasHeight), (0, canvasHeight)
 * left:	(0, canvasHeight/2)
 *  
 * return an array of intersection points in clockwise order. Top left point is in position 0
 */
FoVUtils.getScreenCornersIntersection = function(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker){
	
	var topLeft = topRight = bottomRight = bottomLeft = middleTop = middleBottom = middleLeft = middleRight = null; 
	var in_vMatrix = in_cameraObj.getCameraMatrix();
	var canvasWidth = in_gl_canvas.clientWidth;
	var canvasHeight = in_gl_canvas.clientHeight;
	
	var points = [];
	// TODO The code below can be replaced by 2 nested for loops 
	
	// Screen top
	topLeft = in_raypicker.getIntersectionPointWithSingleModel(0, 0, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	middleTop = in_raypicker.getIntersectionPointWithSingleModel(canvasWidth/2, 0, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	topRight = in_raypicker.getIntersectionPointWithSingleModel(canvasWidth, 0, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	
	// screen middle right
	middleRight = in_raypicker.getIntersectionPointWithSingleModel(canvasWidth, canvasHeight/2, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	// screen bottom
	bottomRight = in_raypicker.getIntersectionPointWithSingleModel(canvasWidth, canvasHeight, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	middleBottom = in_raypicker.getIntersectionPointWithSingleModel(canvasWidth/2, canvasHeight, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	bottomLeft = in_raypicker.getIntersectionPointWithSingleModel(0, canvasHeight, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	
	// screen middle left
	middleLeft = in_raypicker.getIntersectionPointWithSingleModel(0, canvasHeight/2, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	if (topLeft.intersectionPoint.length > 0){
		points.push(topLeft.intersectionPoint);	
	}
	if (middleTop.intersectionPoint.length > 0){
		points.push(middleTop.intersectionPoint);	
	}
	if (topRight.intersectionPoint.length > 0){
		points.push(topRight.intersectionPoint);	
	}
	if (middleRight.intersectionPoint.length > 0){
		points.push(middleRight.intersectionPoint);	
	}
	if (bottomRight.intersectionPoint.length > 0){
		points.push(bottomRight.intersectionPoint);	
	}
	if (middleBottom.intersectionPoint.length > 0){
		points.push(middleBottom.intersectionPoint);	
	}
	if (bottomLeft.intersectionPoint.length > 0){
		points.push(bottomLeft.intersectionPoint);	
	}
	if (middleLeft.intersectionPoint !== undefined){
		points.push(middleLeft.intersectionPoint);	
	}
	
	return points;
};






/** 
 * This function returns the nearest intersection point between one frustum plane
 * and the sphere using the normal to the plane.
 */ 
FoVUtils.getNearestSpherePoint = function(plane){
	
	var points = [];
	var P_intersection_1 = P_intersection_2 = null;
	
	var A = plane[0];
	var B = plane[1];
	var C = plane[2];
	var D = plane[3];
	
	var x_s = y_s = z_s = 0;	// center of the sphere
	var R = 1;	// radius of the sphere
	
	var t1 = R * Math.sqrt( 1 / (A*A + B*B + C*C));
	var t2 = - 1 * R * Math.sqrt( 1 / (A*A + B*B + C*C));
	
	var P_1 = [x_s + A * t1, y_s + B * t1, z_s + C * t1];
	var P_2 = [x_s + A * t2, y_s + B * t2, z_s + C * t2];

	// P_1 distance from plane plane4Circle_1 
	var den = Math.sqrt(A*A + B*B + C*C);
	var dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
	var dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

	P_intersection = P_2;
	if (dist_1 <= dist_2 ){
		P_intersection = P_1;
	}
	
	points.push(P_intersection);
	
	return points;
	
};


/**
 * it computes the intersection points between the sphere and a plane of the frustum (plane4Sphere).
 * To do that, the algo uses 2 perpendicular frustum planes to compute the nearest point to them.
 * input:
 * 	M: P * V * M matrice
 * 	plane4Sphere: the plane the result points belong to	(e.g. top plane)
 * 	plane4Circle_1: perpendicular plane to plane4Sphere to compute the nearest point to plane4Circle_1 (e.g. left plane)
 * 	plane4Circle_2: perpendicular plane to plane4Sphere to compute the nearest point to plane4Circle_2 (e.g. right plane)
 * 
 * returns an array of 2 intersection points, first point computed with plane4Circle_1 and the second with plane4Circle_2
 */
FoVUtils.getFrustumIntersectionWithSphere = function(M, plane4Sphere, plane4Circle_1, plane4Circle_2){
	
	var P_intersection_1 = P_intersection_2 = null;
	var points = [];
	
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
	
		A = plane4Circle_1[0];
		B = plane4Circle_1[1];
		C = plane4Circle_1[2];
		D = plane4Circle_1[3]; 
		
		var t1 = r * Math.sqrt( 1 / (A*A + B*B + C*C));
		var t2 = - 1 * r * Math.sqrt( 1 / (A*A + B*B + C*C));
		
		var P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
		var P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];

		// P_1 distance from plane plane4Circle_1 
		var den = Math.sqrt(A*A + B*B + C*C);
		var dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
		var dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

		P_intersection_1 = P_2;
		if (dist_1 <= dist_2 ){
			P_intersection_1 = P_1;
		}
		
		
		console.log("from plane 1 -> P_intersection_1: "+P_intersection_1);
		
		A = plane4Circle_2[0];
		B = plane4Circle_2[1];
		C = plane4Circle_2[2];
		D = plane4Circle_2[3]; 
		
		t1 = r * Math.sqrt( 1 / (A*A + B*B + C*C));
		t2 = - 1 * r * Math.sqrt( 1 / (A*A + B*B + C*C));
		
		P_1 = [x_c + A * t1, y_c + B * t1, z_c + C * t1];
		P_2 = [x_c + A * t2, y_c + B * t2, z_c + C * t2];
		
		// P_1 distance from plane plane4Circle_1 
		var den = Math.sqrt(A*A + B*B + C*C);
		var dist_1 = Math.abs( A * P_1[0] + B * P_1[1] + C * P_1[2] + D ) / den;
		var dist_2 = Math.abs( A * P_2[0] + B * P_2[1] + C * P_2[2] + D ) / den;

		P_intersection_2 = P_2;
		if (dist_1 <= dist_2 ){
			P_intersection_2 = P_1;
		}
		console.log("from plane 2 -> P_intersection_2: "+P_intersection_2);
		
	}else if ( R_s == d){	// center of circle tangent to the sphere
		var r = 0;
		
		A = plane4Circle_1[0];
		B = plane4Circle_1[1];
		C = plane4Circle_1[2];
		D = plane4Circle_1[3]; 
		
		var P_1 = P_2 = [x_c, y_c, z_c];
		P_intersection_1 = P_intersection_2 = P_1; 
		
	}else{	// center of circle outside the sphere 
		console.log("Top frustum plane not intersecting the sphere");
		P_intersection_1 = P_intersection_2 = null;
	}
	points.push(P_intersection_1);
	points.push(P_intersection_2);
	return points;
};



//FoVUtils.getFoVPolygonWithPlanes = function(in_pMatrix, in_vMatrix, in_mMatrix){
//
//// matrices in column-major order
//var M = mat4.create();
//
//M = mat4.multiply(in_vMatrix, in_mMatrix, M);
//M = mat4.multiply(in_pMatrix, M, M);
//
//
//// top plane normal
//// A = m41 - m21
//// B = m42 - m22
//// C = m43 - m23
//// D = m44 - m24
//var A, B, C, D;
//A = M[3] - M[1];
//B = M[7] - M[5];
//C = M[11] - M[9];
//D = M[15] - M[13];
////var normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//var topPlaneNormal = [M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13]];
////var topPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
//
//
//// bottom plane normal
//// A = m41 + m21
//// B = m42 + m22
//// C = m43 + m23
//// D = m44 + m24 
//A = M[3] + M[1];
//B = M[7] + M[5];
//C = M[11] + M[9];
//D = M[15] + M[13];
////normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//var bottomPlaneNormal = [M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13]];
////var bottomPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
//
//// right plane normal
//// A = m41 - m11
//// B = m42 - m12
//// C = m43 - m13
//// D = m44 - m14
//A = M[3] - M[0];
//B = M[7] - M[4];
//C = M[11] - M[8];
//D = M[15] - M[12];
////normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//var rightPlaneNormal = [M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12]];
////var rightPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
//
//
//// left plane normal
//// A = m41 + m11
//// B = m42 + m12
//// C = m43 + m13
//// D = m44 + m14
//A = M[3] + M[0];
//B = M[7] + M[4];
//C = M[11] + M[8];
//D = M[15] + M[12];
////normDen = Math.sqrt(A*A + B*B + C*C + D*D);
//var leftPlaneNormal = [M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12]];
////var leftPlaneNormal = [A/normDen, B/normDen, C/normDen, D/normDen];
//
//
//var points;
//var footprint = "var aladin = A.aladin('#aladin-lite-div', {target: 'M 1', fov: 0.2});\n" +
//		"var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 3});\n" +
//		"aladin.addOverlay(overlay);\n" +
//		"overlay.addFootprints([A.polygon([";
//		
//var astroCoords = [];
//// top points
//
//points = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
//astroCoords = FoVUtils.convert2Astro(points, "TOP");
//footprint += "["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
//	
//// bottom points
//points = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, leftPlaneNormal, rightPlaneNormal);
//astroCoords = FoVUtils.convert2Astro(points, "BOTTOM");
//footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
//
//// left points
//points = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
//astroCoords = FoVUtils.convert2Astro(points, "LEFT");
//footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
//
//// right points
//points = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, bottomPlaneNormal, topPlaneNormal);
//astroCoords = FoVUtils.convert2Astro(points, "RIGHT");
//footprint += ", ["+astroCoords.raDecDeg_1.ra+", "+astroCoords.raDecDeg_1.dec+"], ["+astroCoords.raDecDeg_2.ra+", "+astroCoords.raDecDeg_2.dec+"]";
//
//footprint += "])])";
//
//console.log(footprint);
//};


//TO BE DELETED - just for debugging
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







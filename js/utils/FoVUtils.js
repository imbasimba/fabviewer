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
	
//	var fovPoly = new FoVPoly();
	
	
	var in_vMatrix = in_cameraObj.getCameraMatrix();
	var in_mMatrix = in_modelObj.getModelMatrix();
	var canvasWidth = in_gl_canvas.clientWidth;
	var canvasHeight = in_gl_canvas.clientHeight;
	
	var points = new Array();
	
//	var obj = {};
	// Starting FIRST type of check
	var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
			0, 0, 
			in_pMatrix, in_cameraObj, 
			in_gl_canvas, in_modelObj);
	// the screen is fully covered by the sphere. (CASE C) 
	if (intersectionWithModel.intersectionPoint.length > 0){
		var cornersPoints = FoVUtils.getScreenCornersIntersection(in_pMatrix, in_cameraObj, in_gl_canvas, in_modelObj, in_raypicker);
		
		points = cornersPoints;
		
		
//		points.push(topPoints[0], middleTopRight[0], rightPoints[0], middleRightBottom[0], bottomPoints[0], middleBottomLeft[0], leftPoints[0], middleLeftTop[0]);
		
		
//		fovPoly.getCorners.push(cornersPoints[0]);
//		fovPoly.getCorners.push(cornersPoints[2]);
//		fovPoly.getCorners.push(cornersPoints[4]);
//		fovPoly.getCorners.push(cornersPoints[6]);
//		
//		fovPoly.getTop.push(cornersPoints[1]);
//		fovPoly.getRight.push(cornersPoints[3]);
//		fovPoly.getBottom.push(cornersPoints[5]);
//		fovPoly.getLeft.push(cornersPoints[7]);
		
		
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
		
		
		
		/**
		 * START TEST
		 */
		
		var intersectionTopMiddle = in_raypicker.getIntersectionPointWithSingleModel(
				canvasWidth/2, 0, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		var intersectionRightMiddle = in_raypicker.getIntersectionPointWithSingleModel(
				canvasWidth, canvasHeight/2, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		var intersectionBottomMiddle = in_raypicker.getIntersectionPointWithSingleModel(
				canvasWidth/2, canvasHeight, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		var intersectionLeftMiddle = in_raypicker.getIntersectionPointWithSingleModel(
				0, canvasHeight/2, 
				in_pMatrix, in_cameraObj, 
				in_gl_canvas, in_modelObj);
		
		// zoomed out. half emisphere fully visible (CASE A) 
		// TODO N.B. this is the less precise algo. To make more precise, instead of computing the middle point between 2 points, 
		// it would be better to divide such segment into 3 or 4 and compute more intersection points with the sphere.
		if (intersectionTopMiddle.intersectionPoint.length == 0 && intersectionRightMiddle.intersectionPoint.length == 0){
			
			var topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
			var bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
			var leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
			var rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
			// computing intermidiate points
			var middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[0], topPoints[0]);
			var middleTopRight = FoVUtils.computeMiddlePoint(topPoints[0], rightPoints[0]);
			var middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[0], bottomPoints[0]);
			var middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[0], leftPoints[0]);
			
			console.log("TOP    ("+topPoints[0].getRADeg()+", "+topPoints[0].getDecDeg()+")");
			console.log("BOTTOM ("+bottomPoints[0].getRADeg()+", "+bottomPoints[0].getDecDeg()+")");
			console.log("LEFT   ("+leftPoints[0].getRADeg()+", "+leftPoints[0].getDecDeg()+")");
			console.log("RIGHT  ("+rightPoints[0].getRADeg()+", "+rightPoints[0].getDecDeg()+")");
			
			console.log("MID LT ("+middleLeftTop[0].getRADeg()+", "+middleLeftTop[0].getDecDeg()+")");
			console.log("MID TR ("+middleTopRight[0].getRADeg()+", "+middleTopRight[0].getDecDeg()+")");
			console.log("MID RB ("+middleRightBottom[0].getRADeg()+", "+middleRightBottom[0].getDecDeg()+")");
			console.log("MID BL ("+middleBottomLeft[0].getRADeg()+", "+middleBottomLeft[0].getDecDeg()+")");
			
			// 8 points in total
			points.push(topPoints[0], middleTopRight[0], rightPoints[0], middleRightBottom[0], bottomPoints[0], middleBottomLeft[0], leftPoints[0], middleLeftTop[0]);
			
		} else if(intersectionTopMiddle.intersectionPoint.length == 0){
			// No intersection between top/bottom frustum planes and the sphere (CASE E)
			var topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
			var bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
			var leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
			var rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
			// computing intermidiate points
			var middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[1], topPoints[0]);
			var middleTopRight = FoVUtils.computeMiddlePoint(topPoints[0], rightPoints[0]);
			var middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[1], bottomPoints[0]);
			var middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[0], leftPoints[0]);
			// 10 points in total
			points.push(topPoints[0], middleTopRight[0], rightPoints[0], rightPoints[1], middleRightBottom[0], bottomPoints[0], middleBottomLeft[0], leftPoints[0], leftPoints[1], middleLeftTop[0]);
		
		} else if(intersectionRightMiddle.intersectionPoint.length == 0){
			// No intersection between right/left frustum planes and the sphere (CASE D)
			var topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
			var bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
			var leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
			var rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
			// computing intermidiate points
			var middleLeftTop = FoVUtils.computeMiddlePoint(leftPoints[0], topPoints[0]);
			var middleTopRight = FoVUtils.computeMiddlePoint(topPoints[1], rightPoints[0]);
			var middleRightBottom = FoVUtils.computeMiddlePoint(rightPoints[0], bottomPoints[0]);
			var middleBottomLeft = FoVUtils.computeMiddlePoint(bottomPoints[1], leftPoints[0]);
			// 10 points in total
			points.push(topPoints[0], topPoints[1], middleTopRight[0], rightPoints[0], middleRightBottom[0], bottomPoints[0], bottomPoints[1], middleBottomLeft[0], leftPoints[0], middleLeftTop[0]);
			
		} else {
			// all frustum planes intersect with the sphere, but the the screen is not fully covered. (CASE B)
			var topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
			var bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
			var leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
			var rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
			// 8 points in total
			points.push(topPoints[0], topPoints[1], rightPoints[0], rightPoints[1], bottomPoints[0], bottomPoints[1], leftPoints[0], leftPoints[1]);
			
		}
		
		
//		console.log(points);
		
		for (var i = 0; i < points.length; i++){
			console.log("("+points[i].getRADeg()+", "+points[i].getDecDeg()+")");
		}
		
		/**
		 * END TEST
		 */
		
//		// this is the case when the screen's corners do not intersect the sphere
//		// testing the intersection of the top screen middle point and the sphere 
//		var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
//				canvasWidth/2, 0, 
//				in_pMatrix, in_cameraObj, 
//				in_gl_canvas, in_modelObj);
//		var singlePoint_tb = false;
//		if (intersectionWithModel.intersectionPoint.length > 0){
//			// TOP and BOTTOM frustum points
//			var topPoints = FoVUtils.getFrustumIntersectionWithSphere(M, topPlaneNormal, leftPlaneNormal, rightPlaneNormal);
//			
//			fovPoly.getTop.push(topPoints[0]);
//			fovPoly.getTop.push(topPoints[1]);
//			
//			var bottomPoints = FoVUtils.getFrustumIntersectionWithSphere(M, bottomPlaneNormal, rightPlaneNormal, leftPlaneNormal);
//
//			fovPoly.getBottom.push(bottomPoints[0]);
//			fovPoly.getBottom.push(bottomPoints[1]);
//
//			
//		}else{
//			singlePoint_tb = true;
//			// TOP and BOTTOM normal projections
//			var topPoints = FoVUtils.getNearestSpherePoint(topPlaneNormal);
//			fovPoly.getTop.push(topPoints[0]);
//			
//			var bottomPoints = FoVUtils.getNearestSpherePoint(bottomPlaneNormal);
//			fovPoly.getBottom.push(bottomPoints[0]);
//		}
//		
//		
//		var intersectionWithModel = in_raypicker.getIntersectionPointWithSingleModel(
//				0, canvasHeight/2, 
//				in_pMatrix, in_cameraObj, 
//				in_gl_canvas, in_modelObj);
//		var singlePoint_lr = false;
//		if (intersectionWithModel.intersectionPoint.length > 0){
//			// LEFT and RIGHT frustum points
//			var leftPoints = FoVUtils.getFrustumIntersectionWithSphere(M, leftPlaneNormal, bottomPlaneNormal, topPlaneNormal);
//			
//			fovPoly.getLeft.push(leftPoints[0]);
//			fovPoly.getLeft.push(leftPoints[1]);
//			
//			var rightPoints = FoVUtils.getFrustumIntersectionWithSphere(M, rightPlaneNormal, topPlaneNormal, bottomPlaneNormal);
//			
//			fovPoly.getRight.push(rightPoints[0]);
//			fovPoly.getRight.push(rightPoints[1]);
//			
//		}else{
//			singlePoint_lr = true;
//			// LEFT and RIGHT normal projections
//			var leftPoints = FoVUtils.getNearestSpherePoint(leftPlaneNormal);
//			fovPoly.getLeft.push(leftPoints[0]);
//			
//			var rightPoints = FoVUtils.getNearestSpherePoint(rightPlaneNormal);
//			fovPoly.getRight.push(rightPoints[0]);
//			
//		}
//		
//		
//		
//		// zoomed out. The sphere is fully visible
//		if (topPoints == 1 == leftPoints){
//			
//			var middleTopLeft = FoVUtils.computeMiddlePoint(fovPoly.getLeft[0], fovPoly.getTop[0]);
//			var middleTopRight = FoVUtils.computeMiddlePoint(fovPoly.getTop[0], fovPoly.getRight[0]);
//			var middleBottomRight = FoVUtils.computeMiddlePoint(fovPoly.getRight[0], fovPoly.getBottom[0]);
//			var middleBottomLeft = FoVUtils.computeMiddlePoint(fovPoly.getBottom[0], fovPoly.getLeft[0]);
//			fovPoly.addCorner(middleTopLeft[0]);
//			fovPoly.addCorner(middleTopRight[0]);
//			fovPoly.addCorner(middleBottomRight[0]);
//			fovPoly.addCorner(middleBottomLeft[0]);
//			
//			
//			
//		}
//		
//		
//		
//		
//		
//		
//		for (var i = 0; i < topPoints.length; i++){
//			points.push(topPoints[i]);	
//		}
//		for (var i = 0; i < rightPoints.length; i++){
//			points.push(rightPoints[i]);	
//		}
//		for (var i = 0; i < bottomPoints.length; i++){
//			points.push(bottomPoints[i]);	
//		}
//		for (var i = 0; i < leftPoints.length; i++){
//			points.push(leftPoints[i]);	
//		}
//		
//		if (singlePoint_lr  && singlePoint_tb){
//			FoVUtils.computeMiddlePoint(points[3], points[0]);
//			FoVUtils.computeMiddlePoint(points[0], points[1]);
//			FoVUtils.computeMiddlePoint(points[1], points[2]);
//			FoVUtils.computeMiddlePoint(points[2], points[3]);
//		}else if (singlePoint_lr ){
//			FoVUtils.computeMiddlePoint(points[5], points[0]);
//			FoVUtils.computeMiddlePoint(points[1], points[2]);
//			FoVUtils.computeMiddlePoint(points[2], points[3]);
//			FoVUtils.computeMiddlePoint(points[4], points[5]);
//		}else if (singlePoint_tb ){
//			FoVUtils.computeMiddlePoint(points[5], points[0]);
//			FoVUtils.computeMiddlePoint(points[0], points[1]);
//			FoVUtils.computeMiddlePoint(points[2], points[3]);
//			FoVUtils.computeMiddlePoint(points[3], points[4]);
//		}
//		
	}
	for (var i = 0; i < points.length; i++){
		console.log("("+points[i].getRADeg()+", "+points[i].getDecDeg()+")");
	}
	
	return points;
	
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
		points.push(new Point(topLeft.intersectionPoint));	
	}
	if (middleTop.intersectionPoint.length > 0){
		points.push(new Point(middleTop.intersectionPoint));	
	}
	if (topRight.intersectionPoint.length > 0){
		points.push(new Point(topRight.intersectionPoint));	
	}
	if (middleRight.intersectionPoint.length > 0){
		points.push(new Point(middleRight.intersectionPoint));	
	}
	if (bottomRight.intersectionPoint.length > 0){
		points.push(new Point(bottomRight.intersectionPoint));	
	}
	if (middleBottom.intersectionPoint.length > 0){
		points.push(new Point(middleBottom.intersectionPoint));	
	}
	if (bottomLeft.intersectionPoint.length > 0){
		points.push(new Point(bottomLeft.intersectionPoint));
	}
	if (middleLeft.intersectionPoint !== undefined){
		points.push(new Point(middleLeft.intersectionPoint));
	}

	return points;
};



FoVUtils.computeMiddlePoint = function(point1, point2){
	var points = [];
	var x_s = y_s = z_s = 0;	// sphere center
	var R = 1;	// sphere radius
	var l, m, n;
	var x_m, y_m, z_m;	// coordinates of the middle point of the segment point1-point2 
	x_m = (point1.getX() + point2.getX()) / 2;
	y_m = (point1.getY() + point2.getY()) / 2;
	z_m = (point1.getZ() + point2.getZ()) / 2;
	
	l = x_m - x_s;
	m = y_m - y_s;
	n = z_m - z_s;
	
	var den = Math.sqrt(l*l + m*m + n*n);
	var x_1 = x_s + (R * l) / den;
	var y_1 = y_s + (R * m) / den;
	var z_1 = z_s + (R * n) / den;
	var dist_1_M = Math.sqrt( (x_1-x_m)*(x_1-x_m) + (y_1-y_m)*(y_1-y_m) + (z_1-z_m)*(z_1-z_m) );
	
	var x_2 = x_s - (R * l) / den;
	var y_2 = y_s - (R * m) / den;
	var z_2 = z_s - (R * n) / den;
	var dist_2_M = Math.sqrt( (x_2-x_m)*(x_2-x_m) + (y_2-y_m)*(y_2-y_m) + (z_2-z_m)*(z_2-z_m) );
	
	
	
	if (dist_1_M < dist_2_M){
		points.push(new Point([x_1, y_1, z_1]));
	}else{
		points.push(new Point([x_2, y_2, z_2]));
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
	
	
	points.push(new Point(P_intersection));
	
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
	points.push(new Point(P_intersection_1));
	points.push(new Point(P_intersection_2));
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





//
//function FoVPoly(){
//	var corners;	// top-left, top-right, bottom-right, bottom-left
//	var top;		// points in clockwise order
//	var right;		// points in clockwise order
//	var bottom;		// points in clockwise order
//	var left;		// points in clockwise order
//
//
//    function init(){
//    	corners = [];
//    	top = [];
//    	right = [];
//    	bottom = [];
//    	left = [];
//    }
//
//    var _public = {
//
//		// corners
//		getCorners: function(){
//            return corners;
//        },
//        getTopLeftCorner: function(){
//            return corners[0];
//        },
//        getTopRightCorner: function(){
//            return corner[1];
//        },
//        getBottomRightCorner: function(){
//            return corners[2];
//        },
//        getBottomLeftCorner: function(){
//            return corners[3];
//        },
//        // point: Point.js
//        addCorner: function(point){
//            corners.push(point);
//        },
//        // point: Point.js
//        addTopLeftCorner: function(point){
//            corners[0] = point;
//        },
//        // point: Point.js
//        addTopRightCorner: function(point){
//            corners[1] = point;
//        },
//        // point: Point.js
//        addBottomRightCorner: function(point){
//            corners[2] = point;
//        },
//        // point: Point.js
//        addBottomLeftCorner: function(point){
//            corners[3] = point;
//        },
//
//        // top
//        getTop: function(){
//        	return top;
//        },
//        // point: Point.js
//		addToTop: function(point){
//			top.push(point);
//		},
//		
//		// right
//		getRight: function(){
//        	return right;
//        },
//        // point: Point.js
//		addToRight: function(point){
//			right.push(point);
//		},
//		
//		
//		// bottom
//		getBottom: function(){
//        	return bottom;
//        },
//        // point: Point.js
//		addToBottom: function(point){
//			bottom.push(point);
//		},
//
//		// left
//		getLeft: function(){
//        	return left;
//        },
//        // point: Point.js
//		addToLeft: function(point){
//			left.push(point);
//		}
//
//    }
// 
//    init();
//    return _public;	
//}




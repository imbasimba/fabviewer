/**
 * @author Fabrizio Giordano (Fab)
 */

function Camera(in_position){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.cam_pos = vec3.create(in_position);
		
		console.log("@@@ CAMERA in_position " + in_position);
//		currentObj.move = vec3.create([ 0, 0, 0 ]);
		
		currentObj.T = mat4.create();
		mat4.identity(currentObj.T);
		
//		currentObj.T_inverse = mat4.create();
//		mat4.identity(currentObj.T_inverse);
		
		currentObj.R = mat4.create();
		mat4.identity(currentObj.R);
		
//		currentObj.R_inverse = mat4.create();
//		mat4.identity(currentObj.R_inverse);
		
		
		currentObj.vMatrix = mat4.create();
		
		
		currentObj.phiRot = 0.0;
		currentObj.thetaRot = 0.0;
		
		currentObj.phi = 0.0;
		currentObj.theta = 0.0;
				
//		mat4.rotate(currentObj.R, Math.PI /2 , [0, 0, 1]);
//		mat4.rotate(currentObj.R, Math.PI / 2, [1, 0, 0]);
		
		
		currentObj.rotateX(Math.PI /2);
//		currentObj.rotateZ(Math.PI /2);
//		
		
		
		
		currentObj.translate(currentObj.cam_pos);
		
//		mat4.inverse(currentObj.T, currentObj.T_inverse);
		console.log("[Camera::translate2] cam_pos -> "+currentObj.cam_pos);
				
		currentObj.refreshViewMatrix();
		
		
	};


	this.translate = function (vec3movement){
		
		mat4.identity(currentObj.T);
		var step = vec3movement[2];
				
		var dotXYZ = vec3.dot(currentObj.cam_pos, currentObj.cam_pos);

		var r = Math.sqrt(dotXYZ) + step;

		currentObj.cam_pos[0] = r * Math.cos(currentObj.phi) * Math.sin(currentObj.theta);
		currentObj.cam_pos[1] = r * Math.sin(currentObj.phi) * Math.sin(currentObj.theta);
		currentObj.cam_pos[2] = r * Math.cos(currentObj.theta);
		
		mat4.translate(currentObj.T, currentObj.cam_pos);

		console.log("[Camera::translate2] currentObj.T -> "+currentObj.T);
		console.log("[Camera::translate2] cam_pos -> "+currentObj.cam_pos);
		console.log("[Camera::translate2] PHI -> "+currentObj.phi);
		console.log("[Camera::translate2] THETA -> "+currentObj.theta);
		
		
//		currentObj.refreshViewMatrix();
		
	};
	
	this.rotateX = function (angleStep){

		mat4.rotate(currentObj.R, angleStep + currentObj.phi, [1, 0, 0]);
		currentObj.phi += angleStep;

	};


	this.rotateY = function (phiRotStep){

		mat4.rotate(currentObj.R, phiRotStep + currentObj.phi, [1, 0, 0]);
		console.log("[Camera::rotate] phi angle deg "+ ( phiRotStep + currentObj.phi) * 180 / Math.PI);
		currentObj.phi += phiRotStep;

	};
	
	
	this.rotateZ = function (thetaRotStep){

		mat4.rotate(currentObj.R, thetaRotStep + currentObj.theta, [0, 0, 1]);
		console.log("[Camera::rotate] theta angle deg "+ ( thetaRotStep + currentObj.theta) * 180 / Math.PI);
		currentObj.theta += thetaRotStep;

	};
	

	
	
	this.rotate = function (phiRotStep, thetaRotStep){

		mat4.identity(currentObj.R);
		
		if (thetaRotStep !== 0){
			currentObj.rotateZ(thetaRotStep);	
		}
		
		if (phiRotStep !== 0){
			currentObj.rotateY(phiRotStep);	
		}
		
				

//		currentObj.refreshViewMatrix();
		
	};
	
	
	
	this.refreshViewMatrix = function(){
		
		console.log("[Camera::refreshViewMatrix] currentObj.R "+currentObj.R);
		console.log("[Camera::refreshViewMatrix] currentObj.T "+currentObj.T);
		
		var transformationMatrix = mat4.create();
		
		mat4.multiply(currentObj.R, currentObj.T, transformationMatrix);
		
		
		
//		currentObj.cam_pos = mat4.multiplyVec3(vMatrix_inverse, [0,0,0], currentObj.cam_pos);
		
//		mat4.multiplyVec3(vMatrix_inverse, currentObj.cam_pos);
//		mat4.multiplyVec3(vMatrix_inverse, [1, 1, 1], currentObj.cam_pos);
		
		
		//cart2spher (cam_position)->phi,theta
//		currentObj.phi = (cartesianToSpherical(currentObj.cam_pos).phi) * Math.PI / 180;
//		currentObj.theta = (cartesianToSpherical(currentObj.cam_pos).theta) * Math.PI / 180;
		
		currentObj.vMatrix = mat4.inverse(transformationMatrix, currentObj.vMatrix);
		
		console.log("[Camera::refreshViewMatrix] phi angle deg "+ currentObj.phi * 180 / Math.PI);
		console.log("[Camera::refreshViewMatrix] theta angle deg "+ currentObj.theta * 180 / Math.PI);
		console.log("[Camera::refreshViewMatrix] cam_pos "+ currentObj.cam_pos);
		console.log("[Camera::refreshViewMatrix] vMatrix "+ currentObj.vMatrix );
		
	};
	
	this.gotoCoordinateDeg = function(raDeg, decDeg){
		
	};

	this.getCameraMatrix = function (){
		
		return currentObj.vMatrix;
	};
	
	this.getCameraPosition = function (){
		return currentObj.cam_pos;
	};
	
	
	this.init();
	
}

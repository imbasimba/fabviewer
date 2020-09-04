/**
 * @author Fabrizio Giordano (Fab)
 */

function Camera2(in_position){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.cam_pos = vec3.create(in_position); // initial camera position
		currentObj.cam_speed = 3.0;
		
		currentObj.vMatrix = mat4.create();
		currentObj.T = mat4.create();
		currentObj.R = mat4.create();
		
		mat4.identity(currentObj.vMatrix); // view matrix
		mat4.identity(currentObj.T); // translation matrix
		mat4.identity(currentObj.R); // rotation matrix
		
		
//		mat4.translate(currentObj.T, 
//				[-1.0 * currentObj.cam_pos[0],
//				-1.0 * currentObj.cam_pos[1],
//				-1.0 * currentObj.cam_pos[2]]);
		
		mat4.translate(currentObj.T, 
				[currentObj.cam_pos[0],
				currentObj.cam_pos[1],
				currentObj.cam_pos[2]]);
		var T_inverse = mat4.create();
		mat4.inverse(currentObj.T, T_inverse);
		
		// TODO add fov in the Camera constructor
		currentObj.FoV = currentObj.previousFoV = 180.0;
		 

//		/* 
//		 * to end up with (up, fwd, rgt) = (z, -x, y) we need these rotation in order:
//		 * 1. 90 deg on the x axis => (up, fwd, rgt) = (z, y, x)
//		 * 2. 90 deg on the z axis => (up, fwd, rgt) = (z, -x, y)
//		 * Rotation matrices must be applied in opposite order 
//		 */
//		// rotation around z axis (point 2.)
//		mat4.rotate(currentObj.R, Math.PI / 2, [0,0,1]);
//		// rotation around x axis (point 1.)
//		mat4.rotate(currentObj.R, Math.PI / 2, [1,0,0]);
		
		var R_inverse = mat4.create();
		mat4.inverse(currentObj.R, R_inverse);
		
		
		
		mat4.multiply(T_inverse, R_inverse,  currentObj.vMatrix);
		
		// I need a vector 4
		currentObj.fwd = vec3.create([0.0, 0.0, -1.0]); 
		currentObj.rgt = vec3.create([1.0, 0.0, 0.0]);
		currentObj.up = vec3.create([0.0, 1.0, 0.0]);
		 
		currentObj.move = vec3.create([0, 0, 0]);
		
		/* 
		 * angle on from z (on the xz plane). from 0 to 180 deg
		 * theta 0 deg => z up
		 * theta 180 deg => z down
		 */
		currentObj.theta = 0.0;
		/* 
		 * angle on from x (on the xy plane). from 0 to 360 deg
		 * phi 0 or 360 deg => x backward (out of the screen)
		 * theta 180 deg => x forward 
		 */
		currentObj.phi = 0.0;
		
//		console.log("[Camera2::init] START -----------");
//		console.log("[Camera2::init] currentObj.cam_pos "+currentObj.cam_pos);
//		console.log("[Camera2::init] currentObj.T ");
//		console.log(currentObj.T);
//		console.log("[Camera2::init] currentObj.R ");
//		console.log(currentObj.R);
//		console.log("[Camera2::init] currentObj.vMatrix ");
//		console.log(currentObj.vMatrix);
//		console.log("[Camera2::init] END -----------");
	};

	this.zoomIn = function(factor){
		
//		console.log("[Camera2::zoomIn] factor "+factor);
//		factor = 0.01;
//		console.log("FACTOR "+factor);
		currentObj.move = vec3.create([0, 0, 0]);
		currentObj.move[2] -= (currentObj.cam_speed * factor);
				
		currentObj.cam_pos[2] += currentObj.move[2];
		
		
		var identity = mat4.create();
		mat4.identity(identity);
		mat4.translate(identity, currentObj.cam_pos, currentObj.T);
		
		currentObj.refreshViewMatrix();
		
	};

	this.zoomOut = function(factor){
		
//		factor = 0.01;

		currentObj.move = vec3.create([0, 0, 0]);
		currentObj.move[2] += currentObj.cam_speed * factor;
		
		currentObj.cam_pos[2] += currentObj.move[2];
		
		var identity = mat4.create();
		mat4.identity(identity);
		mat4.translate(identity, currentObj.cam_pos, currentObj.T);
				
		currentObj.refreshViewMatrix();
		
	};
	
	this.rotateZ = function(sign){
		factorRad = sign * 0.01;
		currentObj.phi += factorRad;
		
		var identity = mat4.create();
		mat4.identity(identity);
		mat4.rotate(currentObj.R, factorRad, [0, 0, 1], currentObj.R);
		

//		console.log("[Camera2::rotateY] END ---------- ");
		
		currentObj.refreshViewMatrix();
		
	};
	
	this.rotateY = function(sign){
		factorRad = sign * 0.01;
		currentObj.phi += factorRad;
		
		var identity = mat4.create();
		mat4.identity(identity);
		mat4.rotate(currentObj.R, factorRad, [0, 1, 0], currentObj.R);

//		console.log("[Camera2::rotateY] END ---------- ");
		
		currentObj.refreshViewMatrix();
		
	};
	
	this.rotateX = function(sign){
//		factorRad = sign * 0.01;
		
		
		factorRad = sign * 0.01;
		
		currentObj.theta += factorRad;
//		console.log("THETA "+currentObj.theta);
		var identity = mat4.create();
		mat4.identity(identity);
		mat4.rotate(currentObj.R, factorRad, [1, 0, 0], currentObj.R);
		
	    
//		console.log("[Camera2::rotateY] END ---------- ");
		
//		mat4.inverse(currentObj.R, currentObj.vMatrix);
		currentObj.refreshViewMatrix();
		
	};

	this.rotate = function(phi, theta){
	
		
		
		var totRot = Math.sqrt(phi*phi + theta*theta);

		pos = this.getCameraPosition();
		dist2Center = Math.sqrt(vec3.dot(pos, pos));
		usedRot = totRot * (dist2Center - 1) / 3.0;

		mat4.rotate(currentObj.R, -(usedRot), [theta/totRot, phi/totRot, 0]);
		
//		console.log("totRotation "+ totRot);
//	    console.log("Camera rotation matrix "+ currentObj.R);
	    currentObj.refreshViewMatrix();
	    
	};
	
	this.refreshViewMatrix = function(){

		
//		console.log("[Camera2::refreshViewMatrix] START   -------");
//		console.log("[Camera::refreshViewMatrix] currentObj.R "+currentObj.R);
//		console.log("[Camera::refreshViewMatrix] currentObj.T "+currentObj.T);
		
		
		var T_inverse = mat4.create();
		var R_inverse = mat4.create();
		mat4.identity(T_inverse);
		mat4.identity(R_inverse);
		
		mat4.inverse(currentObj.T, T_inverse);
		
		mat4.inverse(currentObj.R, R_inverse);
		
//		console.log("[Camera::refreshViewMatrix] currentObj.R_inverse "+ R_inverse);
//		console.log("[Camera::refreshViewMatrix] currentObj.T_inverse "+ T_inverse);
		
		
		mat4.multiply(T_inverse, R_inverse, currentObj.vMatrix);
		
//		console.log("[Camera2::refreshViewMatrix] END   -------");
	};
	
	
	this.refreshFoV = function(currentFoV){
		
		currentObj.previousFoV = currentObj.FoV;
		currentObj.FoV = currentFoV;
		
	};

	this.getCameraMatrix = function (){
		
		return currentObj.vMatrix;
	};
	
	this.getCameraPosition = function (){
		// to be initiated into the init 
		var vMatrix_inverse = mat4.create();
		mat4.identity(vMatrix_inverse);
		mat4.inverse(currentObj.vMatrix, vMatrix_inverse );
		return [vMatrix_inverse[12], vMatrix_inverse[13], vMatrix_inverse[14]];
	};
		
	
	this.init();
	
}

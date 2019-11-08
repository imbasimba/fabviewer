/**
 * @author Fabrizio Giordano (Fab)
 */

function Camera(in_position){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.cam_pos = vec3.create(in_position);
		currentObj.move = vec3.create([ 0, 0, 0 ]);
		
		currentObj.T = mat4.create();
		mat4.identity(currentObj.T);
		
		currentObj.T_inverse = mat4.create();
		mat4.identity(currentObj.T_inverse);
		
		currentObj.R = mat4.create();
		mat4.identity(currentObj.R);
		
		currentObj.R_inverse = mat4.create();
		mat4.identity(currentObj.R_inverse);
		
//		mat4.translate(currentObj.T, currentObj.cam_pos, currentObj.T);
		
		currentObj.vMatrix = mat4.create();
		mat4.multiply(currentObj.R, currentObj.T, currentObj.vMatrix);
		
		this.translate(in_position);
		
	};
	
	this.translate = function (vec3movement){
		
//		console.log("[Camera]currentObj.vMatrix ");
//		console.log(currentObj.vMatrix );
		currentObj.cam_pos = vec3.add(currentObj.cam_pos, vec3movement);
		mat4.identity(currentObj.T);
		mat4.translate(currentObj.T, currentObj.cam_pos);
//		console.log("[Camera]currentObj.T");
//		console.log(currentObj.T );
		mat4.inverse(currentObj.T, currentObj.T_inverse);
		currentObj.vMatrix = currentObj.T_inverse;
//		console.log("[Camera]currentObj.vMatrix ");
//		console.log(currentObj.vMatrix );
	};

	this.rotate = function (){
		// TODO
	};

	this.getCameraMatrix = function (){
		return currentObj.vMatrix;
	};
	
	this.getCameraPosition = function (){
		return currentObj.cam_pos;
	};
	
	
	this.init();
	
}

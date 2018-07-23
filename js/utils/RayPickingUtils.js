/**
 * @author Fabrizio Giordano (Fab)
 */


function RayPickingUtils(){
	
	var currentObj = this;

	this.getRayFromMouse =  function(in_mouseX, in_mouseY, in_projectionMatrix, in_cameraMatrix, in_gl_canvas ) {
		
		var rect = in_gl_canvas.getBoundingClientRect();
		
		var canvasMX = in_mouseX - rect.left;
		var canvasMY = in_mouseY - rect.top;
		
		var x = ( 2.0 * canvasMX ) / in_gl_canvas.clientWidth - 1.0;
		var y = 1.0 - ( 2.0 * canvasMY ) / in_gl_canvas.clientHeight;
		var z = 1.0;

		// normalized device space
		var rayNds = vec3.create([x, y, z]);
		
		// clip space
		var rayClip = [rayNds[0], rayNds[1], -1.0, 1.0];
		
		// eye space
		var pMatrixInverse = mat4.create();
		mat4.identity(pMatrixInverse);
		mat4.inverse(in_projectionMatrix, pMatrixInverse);
		var rayEye = [];
		mat4.multiplyVec4(pMatrixInverse, rayClip, rayEye);
		rayEye = [rayEye[0], rayEye[1], -1.0, 0.0];
		
		// world space
		var rayWorld = [];
		var vMatrixInverse = mat4.create();
		mat4.identity(vMatrixInverse);
		mat4.inverse(in_cameraMatrix, vMatrixInverse);
		mat4.multiplyVec4(vMatrixInverse, rayEye, rayWorld);
		vec3.normalize(rayWorld, rayWorld);
		
		return rayWorld;
		
	};
		
	this.raySphere = function (rayOrigWorld, rayDirectionWorld, model){
		var intersectionDistance = -1;
		var distToMoldel = vec3.create();
		vec3.subtract(rayOrigWorld, model.center, distToMoldel);
		var b = vec3.dot(rayDirectionWorld, distToMoldel);
		var c = vec3.dot(distToMoldel, distToMoldel) - model.radius * model.radius;
		var bSquaredMinus_c = b * b - c;
		
		if (bSquaredMinus_c > 0.0){
			console.log("TAKEN!!!");
			var t_a = -b + Math.sqrt(bSquaredMinus_c);
			var t_b = -b - Math.sqrt(bSquaredMinus_c);
//			console.log("t_a ->"+t_a);
//			console.log("t_b->"+t_b);
			if (t_a < 0.0){
				if (t_b < 0.0){
					console.log("intersection behind your shoulder");
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
				console.log("intersection behind your shoulder");
			}else{
				intersectionDistance = t;
			}
		}else{
			console.log("Cilecca!!!");
		}
		return intersectionDistance;
	};
	
}




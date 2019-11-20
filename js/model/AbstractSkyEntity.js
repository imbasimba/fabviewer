/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */
function AbstractSkyEntity(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
	
	var currentObj = this;
	
	this.init = function(){
		
		currentObj.refreshGeometryOnFoVChanged = false;
		
		currentObj.fovObj = new FoV(in_gl, in_canvas, currentObj);
		
		currentObj.minFoV = 180;
		
		currentObj.prevMinFoV = 180;
		
		currentObj.fovX_deg = 180;
		
		currentObj.fovY_deg = 180;
		
		currentObj.name = in_name;
		
		currentObj.center = vec3.create(in_position);
		
		currentObj.radius = in_radius;
		
		currentObj.textures = [];
		
		// GL related
		currentObj.vertexTextureCoordBuffer = in_gl.createBuffer();
		
		currentObj.vertexPositionBuffer = in_gl.createBuffer();
		
		currentObj.vertexIndexBuffer = in_gl.createBuffer();
		
//		currentObj.vertexNormalBuffer  = in_gl.createBuffer();
		
		currentObj.shaderProgram = in_gl.createProgram();
		
		// Matrices related
		currentObj.T = mat4.create();
		mat4.identity(currentObj.T);
		
		currentObj.R = mat4.create();
		mat4.identity(currentObj.R);
		
		currentObj.modelMatrix = mat4.create();
		mat4.identity(currentObj.modelMatrix);
		
		currentObj.inverseModelMatrix = mat4.create();
		mat4.identity(currentObj.inverseModelMatrix);
		
		// Initial position
		currentObj.translate(currentObj.center);
		currentObj.rotate(in_xRad, in_yRad);
		
	};
	
	this.translate = function(in_translation){
		mat4.translate(currentObj.T, currentObj.center);
		currentObj.refreshModelMatrix();
	};
	
	this.rotate = function(rad1, rad2){
		
		//mat4.identity(currentObj.R);
//		console.log("rotation matrix "+currentObj.R);
		


		//currentObj.R = this.rotateX(currentObj.R, rad1);
//	    console.log("rotation matrix "+currentObj.R);

	    mat4.rotate(currentObj.R, rad2, [0, 0, 1]);
		mat4.rotate(currentObj.R, rad1, [1, 0, 0]);
	    //currentObj.R = this.rotateY(currentObj.R, rad2);
//	    console.log("rotation matrix "+currentObj.R);
	    
	    currentObj.refreshModelMatrix();

	};

	this.rotateFromZero = function(rad1, rad2){
		
		mat4.identity(currentObj.R);
		console.log("rotation matrix "+currentObj.R);
		

		mat4.rotate(currentObj.R, rad1, [1, 0, 0]);
		//currentObj.R = this.rotateX(currentObj.R, rad1);
	    console.log("rotation matrix "+currentObj.R);

	    mat4.rotate(currentObj.R, rad2, [0, 0, 1]);
	    //currentObj.R = this.rotateY(currentObj.R, rad2);
	    console.log("rotation matrix "+currentObj.R);
	    
	    currentObj.refreshModelMatrix();

	};
	
	this.refreshModelMatrix = function(){
		
		var R_inverse = mat4.create();
		mat4.identity(R_inverse);
		mat4.inverse(currentObj.R, R_inverse);
		
		mat4.multiply(currentObj.T, R_inverse, currentObj.modelMatrix);
	};
	
	this.getModelMatrixInverse = function(){
		mat4.identity(currentObj.inverseModelMatrix);
		mat4.inverse(currentObj.modelMatrix, currentObj.inverseModelMatrix);
		return currentObj.inverseModelMatrix;
	};
	
	this.setMatricesUniform = function(projectionMatrix, cameraMatrix){
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.mMatrixUniform, false, currentObj.modelMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.pMatrixUniform, false, projectionMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.vMatrixUniform, false, cameraMatrix);
	};
	
	this.initShaders = function(){
		// Abstract
	};
	
	this.initBuffers = function(){
		// Abstract
	};
	
	this.initTextures = function(){
		// Abstract
	};
	
	this.draw = function(){
		// Abstract
	};
	
	this.drawAndSetMatrixUniform = function(projectionMatrix, cameraMatrix){
		currentObj.draw();
		currentObj.setMatricesUniform(projectionMatrix, cameraMatrix);
	};
	
	this.getFoV = function (in_pMatrix, in_camera, in_raypicker){
		var fovXY = currentObj.fovObj.getFoV(in_pMatrix, in_camera, in_raypicker);
		currentObj.setGeometryNeedsToBeRefreshed();
//		currentObj.prevMinFoV = currentObj.getMinFoV();
		return fovXY;
		
	};
	
	this.getMinFoV = function(){
		return currentObj.fovObj.minFoV;
	};
	
	// Method overwritten by sons having hierarchical geometry (e.g. HiPS)
	this.setGeometryNeedsToBeRefreshed = function (){
		currentObj.refreshGeometryOnFoVChanged = false;
	};
	
	
	this.rotateX = function(m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];

        m[1] = m[1]*c-m[2]*s;
        m[5] = m[5]*c-m[6]*s;
        m[9] = m[9]*c-m[10]*s;

        m[2] = m[2]*c+mv1*s;
        m[6] = m[6]*c+mv5*s;
        m[10] = m[10]*c+mv9*s;
        
        return m;
        
     }

     this.rotateY = function(m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c*m[0]+s*m[2];
        m[4] = c*m[4]+s*m[6];
        m[8] = c*m[8]+s*m[10];

        m[2] = c*m[2]-s*mv0;
        m[6] = c*m[6]-s*mv4;
        m[10] = c*m[10]-s*mv8;
        
        return m;
	 }
	 	
	this.init();
	
	
}
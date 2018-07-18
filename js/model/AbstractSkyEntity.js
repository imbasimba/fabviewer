/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */
function AbstractSkyEntity(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
	
	var currentObj = this;
	
	this.init = function(){
		
		currentObj.fovUtils = in_fovUtils;
		
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
	
	this.rotate = function(in_xRad, in_yRad){
//		mat4.rotate(currentObj.modelMatrix, in_xRad, [0, 1, 0], currentObj.modelMatrix);
//	    mat4.rotate(currentObj.modelMatrix, in_yRad, [1, 0, 0], currentObj.modelMatrix);
	    mat4.rotate(currentObj.R, in_xRad, [0, 1, 0]);
	    mat4.rotate(currentObj.R, in_yRad, [1, 0, 0]);
	    currentObj.refreshModelMatrix();
	};
	
	this.refreshModelMatrix = function(){
		mat4.multiply(currentObj.T, currentObj.R, currentObj.modelMatrix);
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
	
	this.init();
}
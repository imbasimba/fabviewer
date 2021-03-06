/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */
import FoV from './FoV';
import {vec3, mat4} from 'gl-matrix';
class AbstractSkyEntity{
	
	constructor(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
		
		this.fovObj = new FoV(this);
//		this.fovObj = new FoV(in_gl, in_canvas, this);
		this.refreshMe = false;
		this.fovX_deg = 180;
		this.fovY_deg = 180;
		this.prevFoV = this.fovX_deg;
		this.name = in_name;
		this.center = vec3.clone(in_position);
		this.radius = in_radius;
		
		
		// GL related
		this.vertexTextureCoordBuffer = in_gl.createBuffer();
		this.vertexPositionBuffer = in_gl.createBuffer();
		this.vertexIndexBuffer = in_gl.createBuffer();
		this.shaderProgram = in_gl.createProgram();
		
		// Matrices related
		this.T = mat4.create();
		
		this.R = mat4.create();
		
		this.modelMatrix = mat4.create();
		
		this.inverseModelMatrix = mat4.create();
		
		// Initial position
		this.translate(this.center);
		this.rotate(in_xRad, in_yRad);
	}
	
	
	
	
	translate(in_translation){
		mat4.translate(this.T, this.T, this.center);
		this.refreshModelMatrix();
	}
	
	rotate(rad1, rad2){

	    mat4.rotate(this.R, this.R, rad2, [0, 0, 1]);
		mat4.rotate(this.R, this.R, rad1, [1, 0, 0]);
	    
		this.refreshModelMatrix();

	}

	rotateFromZero(rad1, rad2){
		
		mat4.identity(this.R);
		mat4.rotate(this.R, this.R, rad1, [1, 0, 0]);
	    mat4.rotate(this.R, this.R, rad2, [0, 0, 1]);
	    this.refreshModelMatrix();

	}
	
	refreshModelMatrix(){
		
		var R_inverse = mat4.create();
		mat4.invert(R_inverse, this.R);
		mat4.multiply(this.modelMatrix, this.T, R_inverse);
		
	}
	
	getModelMatrixInverse(){
		
		mat4.identity(this.inverseModelMatrix);
		mat4.invert(this.inverseModelMatrix, this.modelMatrix);
		return this.inverseModelMatrix;
		
	}
	
	
	getModelMatrix(){
		return this.modelMatrix;
	}
	
	setMatricesUniform (projectionMatrix, cameraMatrix){
		
		in_gl.uniformMatrix4fv(this.shaderProgram.mMatrixUniform, false, this.modelMatrix);
		in_gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, projectionMatrix);
		in_gl.uniformMatrix4fv(this.shaderProgram.vMatrixUniform, false, cameraMatrix);
		
	}
	
	initShaders (){
		// Abstract
	}
	
	initBuffers(){
		// Abstract
	}
	
	initTextures (){
		// Abstract
	}
	
	draw (){
		// Abstract
	}
	
	drawAndSetMatrixUniform (projectionMatrix, cameraMatrix){
		this.draw();
		this.setMatricesUniform(projectionMatrix, cameraMatrix);
	}
	
	refreshFoV(){
//		refreshFoV(in_pMatrix, in_camera, in_raypicker){
		
		var fovObj = this.fovObj.getFoV();
//		var fovObj = this.fovObj.getFoV(in_pMatrix, in_camera, in_raypicker);
		return fovObj;
		
	}
	
	
	refreshModel (in_fov, in_pan, in_camera){
		// Abstract
		console.log("[AbstractSkyEntity::refreshModel]");
	}
	
	
	
	getMinFoV (){
		return this.fovObj.minFoV;
	}
	
	// Method overwritten by children having hierarchical geometry (e.g. HiPS)
	setGeometryNeedsToBeRefreshed (){
		this.refreshGeometryOnFoVChanged = false;
	};
	
	
	rotateX (m, angle) {
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

     rotateY (m, angle) {
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
	
	
}

export default AbstractSkyEntity;
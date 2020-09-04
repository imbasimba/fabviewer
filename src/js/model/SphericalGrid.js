import {degToRad} from '../utils/Utils';
class SphericalGrid{
	constructor(in_radius, in_gl){
		this.in_gl = in_gl;
		this.localInit(in_radius);
		this.initBuffer();
	}
	
	localInit(in_radius){
		
		var phiStep = 10;
		var thetaStep = 10;
		
		this.radius = in_radius;
		
		this.thetaStep = thetaStep;
		this.phiStep = phiStep;
		this.phiArray = [];
		this.thetaArray = [];
		
		this.phiVertexPositionBuffer = this.in_gl.createBuffer();
		this.thetaVertexPositionBuffer = this.in_gl.createBuffer();
			
	};
	
	initShaders() {
		// not needed
	};
	
	setUniformLocation(){
		// not needed
	};
	
	initBuffer(){
		
		var x, y, z;
		var phiVertexPosition, thetaVertexPosition;
		var thetaRad, phiRad;
		
		var r = this.radius;
		
		for (var theta = 0; theta < 180; theta += this.thetaStep){
			
			phiVertexPosition = new Float32Array(360/this.phiStep * 3);
			
			thetaRad = degToRad(theta);

			for (var phi = 0; phi <360; phi += this.phiStep){
				
				phiRad = degToRad(phi);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				phiVertexPosition[ 3 * (phi/this.phiStep)] = x; 
				phiVertexPosition[ 3 * (phi/this.phiStep) + 1] = y;
				phiVertexPosition[ 3 * (phi/this.phiStep) + 2] = z;
				
			}
			
			this.phiArray.push(phiVertexPosition);

		}
		
		for (var phi = 0; phi <360; phi += this.phiStep){
						
			thetaVertexPosition = new Float32Array(360/this.thetaStep * 3);
			
			phiRad = degToRad(phi);
			
			for (var theta = 0; theta <360; theta += this.thetaStep){
				
				thetaRad = degToRad(theta);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				
				thetaVertexPosition[ 3 * (theta/this.thetaStep)] = x; 
				thetaVertexPosition[ 3 * (theta/this.thetaStep) + 1] = y;
				thetaVertexPosition[ 3 * (theta/this.thetaStep) + 2] = z;
	
			}
			
			this.thetaArray.push(thetaVertexPosition);
			
		}
		
	};
	
	
	enableBuffer(shaderProgram){
		
		shaderProgram.sphericalGridEnabledUniform = this.in_gl.getUniformLocation(shaderProgram, "uSphericalGrid");
		
		this.in_gl.uniform1f(shaderProgram.sphericalGridEnabledUniform, 1.0);
		
		for (var i = 0; i < this.phiArray.length; i++){
			
			this.in_gl.bindBuffer(this.in_gl.ARRAY_BUFFER, this.phiVertexPositionBuffer);
			this.in_gl.bufferData(this.in_gl.ARRAY_BUFFER, this.phiArray[i], this.in_gl.STATIC_DRAW);
			this.in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.in_gl.FLOAT, false, 0, 0);
			this.in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			this.in_gl.drawArrays(this.in_gl.LINE_LOOP, 0, 360/this.phiStep);
			
		}
		
		for (var j = 0; j < this.thetaArray.length; j++){
		
			this.in_gl.bindBuffer(this.in_gl.ARRAY_BUFFER, this.thetaVertexPositionBuffer);
			this.in_gl.bufferData(this.in_gl.ARRAY_BUFFER, this.thetaArray[j], this.in_gl.STATIC_DRAW);
			this.in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.in_gl.FLOAT, false, 0, 0);
			this.in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			this.in_gl.drawArrays(this.in_gl.LINE_LOOP, 0, 360/this.thetaStep);
			
		}
		
	};
	
	draw(shaderProgram){
		
		this.enableBuffer(shaderProgram);
		
	};
	
}

export default SphericalGrid;
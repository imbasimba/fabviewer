class XYZSystem{
	constructor(in_gl){
		this.in_gl = in_gl;
		this.localInit();
		this.initBuffer();
	}

	localInit(){
		this.refSysPositionX = new Float32Array(3 * 2);
		this.refSysPositionY = new Float32Array(3 * 2);
		this.refSysPositionZ = new Float32Array(3 * 2);
	};
	
	initBuffer(){
//		var versors = [
//			[1.5, 0.0, 0.0],
//			[0.0, 1.5, 0.0],
//			[0.0, 0.0, 1.5]
//			];
		
		this.refSysPositionX[0] = 0.0;
		this.refSysPositionX[1] = 0.0;
		this.refSysPositionX[2] = 0.0;
		this.refSysPositionX[3] = 1.5;
		this.refSysPositionX[4] = 0.0;
		this.refSysPositionX[5] = 0.0;
		
		this.refSysPositionY[0] = 0.0;
		this.refSysPositionY[1] = 0.0;
		this.refSysPositionY[2] = 0.0;
		this.refSysPositionY[3] = 0.0;
		this.refSysPositionY[4] = 1.5;
		this.refSysPositionY[5] = 0.0;
		
		this.refSysPositionZ[0] = 0.0;
		this.refSysPositionZ[1] = 0.0;
		this.refSysPositionZ[2] = 0.0;
		this.refSysPositionZ[3] = 0.0;
		this.refSysPositionZ[4] = 0.0;
		this.refSysPositionZ[5] = 1.5;
				
		
		this.refSysPositionXBuffer = this.in_gl.createBuffer();
		this.refSysPositionYBuffer = this.in_gl.createBuffer();
		this.refSysPositionZBuffer = this.in_gl.createBuffer();
	};
	
	
	enableBuffer(shaderProgram){
		
		shaderProgram.sphericalGridEnabledUniform = this.in_gl.getUniformLocation(shaderProgram, "uSphericalGrid");
		/*
		 * x: red
		 * y: green
		 * z: blue
		 */
		// rendering X axes
		this.in_gl.uniform1f(shaderProgram.sphericalGridEnabledUniform, 2.0);
		this.in_gl.bindBuffer(this.in_gl.ARRAY_BUFFER, this.refSysPositionXBuffer);
		this.in_gl.bufferData(this.in_gl.ARRAY_BUFFER, this.refSysPositionX, this.in_gl.STATIC_DRAW);
		this.in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.in_gl.FLOAT, false, 0, 0);
		this.in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		this.in_gl.drawArrays(this.in_gl.LINE_STRIP, 0, 2);

		// rendering Y axes
		this.in_gl.uniform1f(shaderProgram.sphericalGridEnabledUniform, 3.0);
		this.in_gl.bindBuffer(this.in_gl.ARRAY_BUFFER, this.refSysPositionYBuffer);
		this.in_gl.bufferData(this.in_gl.ARRAY_BUFFER, this.refSysPositionY, this.in_gl.STATIC_DRAW);
		this.in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.in_gl.FLOAT, false, 0, 0);
		this.in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		this.in_gl.drawArrays(this.in_gl.LINE_STRIP, 0, 2);

		// rendering Z axes
		this.in_gl.uniform1f(shaderProgram.sphericalGridEnabledUniform, 4.0);
		this.in_gl.bindBuffer(this.in_gl.ARRAY_BUFFER, this.refSysPositionZBuffer);
		this.in_gl.bufferData(this.in_gl.ARRAY_BUFFER, this.refSysPositionZ, this.in_gl.STATIC_DRAW);
		this.in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.in_gl.FLOAT, false, 0, 0);
		this.in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		this.in_gl.drawArrays(this.in_gl.LINE_STRIP, 0, 2);

	};
	
	draw(shaderProgram){
		this.enableBuffer(shaderProgram);
	};

}

export default XYZSystem;
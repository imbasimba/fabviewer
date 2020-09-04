function SphericalGrid(in_radius, in_gl){
	
	
	var currentObj = this;
//	console.log(currentObj);

	this.localInit = function(){
		
		var phiStep = 10;
		var thetaStep = 10;
		
		currentObj.radius = in_radius;
		
		currentObj.thetaStep = thetaStep;
		currentObj.phiStep = phiStep;
		currentObj.phiArray = [];
		currentObj.thetaArray = [];
		
		currentObj.phiVertexPositionBuffer = in_gl.createBuffer();
		currentObj.thetaVertexPositionBuffer = in_gl.createBuffer();
			
	};
	
	this.initShaders = function () {
		// not needed
	};
	
	this.setUniformLocation = function(){
		// not needed
	};
	
	this.initBuffer = function(){
		
		var x, y, z;
		var phiVertexPosition, thetaVertexPosition;
		var thetaRad, phiRad;
		
		var r = currentObj.radius;
		
		for (var theta = 0; theta < 180; theta += currentObj.thetaStep){
			
			phiVertexPosition = new Float32Array(360/currentObj.phiStep * 3);
			
			thetaRad = degToRad(theta);

			for (var phi = 0; phi <360; phi += currentObj.phiStep){
				
				phiRad = degToRad(phi);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				phiVertexPosition[ 3 * (phi/currentObj.phiStep)] = x; 
				phiVertexPosition[ 3 * (phi/currentObj.phiStep) + 1] = y;
				phiVertexPosition[ 3 * (phi/currentObj.phiStep) + 2] = z;
				
			}
			
			currentObj.phiArray.push(phiVertexPosition);

		}
		
		for (var phi = 0; phi <360; phi += currentObj.phiStep){
						
			thetaVertexPosition = new Float32Array(360/currentObj.thetaStep * 3);
			
			phiRad = degToRad(phi);
			
			for (var theta = 0; theta <360; theta += currentObj.thetaStep){
				
				thetaRad = degToRad(theta);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				
				thetaVertexPosition[ 3 * (theta/currentObj.thetaStep)] = x; 
				thetaVertexPosition[ 3 * (theta/currentObj.thetaStep) + 1] = y;
				thetaVertexPosition[ 3 * (theta/currentObj.thetaStep) + 2] = z;
	
			}
			
			currentObj.thetaArray.push(thetaVertexPosition);
			
		}
		
	};
	
	
	this.enableBuffer = function(shaderProgram){
		
		shaderProgram.sphericalGridEnabledUniform = in_gl.getUniformLocation(shaderProgram, "uSphericalGrid");
		
		in_gl.uniform1f(shaderProgram.sphericalGridEnabledUniform, 1.0);
		
		for (var i = 0; i < currentObj.phiArray.length; i++){
			
			in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.phiVertexPositionBuffer);
			in_gl.bufferData(in_gl.ARRAY_BUFFER, currentObj.phiArray[i], in_gl.STATIC_DRAW);
			in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, in_gl.FLOAT, false, 0, 0);
			in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			in_gl.drawArrays(in_gl.LINE_LOOP, 0, 360/currentObj.phiStep);
			
		}
		
		for (var j = 0; j < currentObj.thetaArray.length; j++){
		
			in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.thetaVertexPositionBuffer);
			in_gl.bufferData(in_gl.ARRAY_BUFFER, currentObj.thetaArray[j], in_gl.STATIC_DRAW);
			in_gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, in_gl.FLOAT, false, 0, 0);
			in_gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			in_gl.drawArrays(in_gl.LINE_LOOP, 0, 360/currentObj.thetaStep);
			
		}
		
	};
	
	this.draw = function(shaderProgram){
		
		currentObj.enableBuffer(shaderProgram);
		
	};
	
	this.localInit();
	this.initBuffer();
	
	
}
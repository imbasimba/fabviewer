function Catalogue(in_radius, in_gl, in_canvas, in_position, 
		in_xRad, in_yRad, in_name, in_fovUtils, cooFrame, refEpoch){
	
	AbstractSkyEntity.call(this, in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils);
	var CatalogueObj = this;

	
	this.localInit = function(){
		CatalogueObj.sources = [];	// array of Source
	};
	
	this.getName = function(){
		return CatalogueObj.in_name;
	};
	
	
	
	this.initShaders = function () {
		var fragmentShader = getShader("cat-shader-fs");
		var vertexShader = getShader("cat-shader-vs");

		in_gl.attachShader(CatalogueObj.shaderProgram, vertexShader);
		in_gl.attachShader(CatalogueObj.shaderProgram, fragmentShader);
		in_gl.linkProgram(CatalogueObj.shaderProgram);

		if (!in_gl.getProgramParameter(CatalogueObj.shaderProgram, in_gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		in_gl.useProgram(CatalogueObj.shaderProgram);

		CatalogueObj.setUniformLocation(); 
		
	    function getShader(id){
	    	var shaderScript = document.getElementById(id);
			if (!shaderScript) {
				return null;
			}

			var str = "";
			var k = shaderScript.firstChild;
			while (k) {
				if (k.nodeType == 3) {
					str += k.textContent;
				}
				k = k.nextSibling;
			}

			var shader;
			if (shaderScript.type == "x-shader/x-fragment") {
				shader = in_gl.createShader(in_gl.FRAGMENT_SHADER);
			} else if (shaderScript.type == "x-shader/x-vertex") {
				shader = in_gl.createShader(in_gl.VERTEX_SHADER);
			} else {
				return null;
			}

			in_gl.shaderSource(shader, str);
			in_gl.compileShader(shader);

			if (!in_gl.getShaderParameter(shader, in_gl.COMPILE_STATUS)) {
				alert(in_gl.getShaderInfoLog(shader));
				return null;
			}

			return shader;
	    }
	};
	
	this.setUniformLocation = function(){

		CatalogueObj.shaderProgram.pMatrixUniform = in_gl.getUniformLocation(CatalogueObj.shaderProgram, "uPMatrix");
		CatalogueObj.shaderProgram.mvMatrixUniform = in_gl.getUniformLocation(CatalogueObj.shaderProgram, "uMVMatrix");

	};
	
	this.initBuffer = function () {
		CatalogueObj.vertexCataloguePositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, CatalogueObj.vertexCataloguePositionBuffer);
		var nSources = CatalogueObj.sources.length;
		var vertexCataloguePosition = new Float32Array(nSources*3);
		var positionIndex = 0;
//			var epsilon = 0.00000001;
		var epsilon = 0.0;
		for(var j = 0; j < nSources; j++){
			
			vertexCataloguePosition[positionIndex] = CatalogueObj.sources[j].x + epsilon;
			vertexCataloguePosition[positionIndex+1] = CatalogueObj.sources[j].y + epsilon;
			vertexCataloguePosition[positionIndex+2] = CatalogueObj.sources[j].z + epsilon;
			positionIndex +=3;
			
		}

		gl.bufferData(gl.ARRAY_BUFFER, vertexCataloguePosition, gl.STATIC_DRAW);
		CatalogueObj.vertexIndexBuffer.itemSize = 3;
		CatalogueObj.vertexIndexBuffer.numItems = vertexCataloguePosition.length/3;

	};
	
	// This function is not really needed. It could be used to load icons/images for source drawing 
	this.initTexture = function (now) {
		
	};
	
	this.computeVisibility = function (now) {
		// if we assign an Npix of nside 512 or more to each source, we can use HEALPix to compute the visibility 
	};
	
	
	this.draw = function(pMatrix, vMatrix){
		in_gl.useProgram(CatalogueObj.shaderProgram);
		
		CatalogueObj.catUniformMVMatrixLoc = in_gl.getUniformLocation(CatalogueObj.shaderProgram, "uMVMatrix");
		CatalogueObj.catUniformProjMatrixLoc = in_gl.getUniformLocation(CatalogueObj.shaderProgram, "uPMatrix");
		CatalogueObj.vertexCatPositionAttributeLoc = in_gl.getAttribLocation(CatalogueObj.shaderProgram, 'aCatPosition');
		  
	
		in_gl.uniformMatrix4fv(CatalogueObj.shaderProgram.mvMatrixUniform, false, CatalogueObj.modelMatrix);
		in_gl.uniformMatrix4fv(CatalogueObj.shaderProgram.pMatrixUniform, false, pMatrix);
		in_gl.uniformMatrix4fv(CatalogueObj.shaderProgram.vMatrixUniform, false, vMatrix);
		

				
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, CatalogueObj.vertexPositionBuffer);
		in_gl.vertexAttribPointer(CatalogueObj.shaderProgram.vertexPositionAttribute, CatalogueObj.vertexPositionBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		
		in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, CatalogueObj.vertexIndexBuffer);
		
	    in_gl.enableVertexAttribArray(CatalogueObj.shaderProgram.vertexPositionAttribute);
		

	    in_gl.bindBuffer(gl.ARRAY_BUFFER, CatalogueObj.vertexCataloguePositionBuffer);
	    in_gl.vertexAttribPointer(CatalogueObj.vertexCatPositionAttributeLoc, 
				CatalogueObj.vertexIndexBuffer.itemSize, 
				in_gl.FLOAT, false, 0, 0);
	    in_gl.enableVertexAttribArray(CatalogueObj.vertexCatPositionAttributeLoc);
	    in_gl.drawArrays(in_gl.POINTS, 0, CatalogueObj.vertexIndexBuffer.numItems);
		
	};

	/*
	 * source: single Source objects
	 */
	this.addSource = function(source){
		/* TODO after adding a new source, the source position 
		 * should be added to the GL buffer (initBuffer for a 
		 * single source)*/
		CatalogueObj.sources.push(source);
	};
	
	/*
	 * sources: array of Source
	 */
	this.addSources = function(sources){
		CatalogueObj.sources = sources;
		CatalogueObj.initBuffer();
	};
	
	this.localInit();
	this.initShaders();
}
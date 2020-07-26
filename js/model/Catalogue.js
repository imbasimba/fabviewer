"use strict";
class Catalogue{
	
	#name;
	#metadata;
	#raIdx;
	#decIdx;
	#nameIdx;
	#shaderProgram;
	#gl;
	#vertexCataloguePositionBuffer;
	#vertexIndexBuffer;
	#sources = [];
	
	constructor(in_name, in_metadata, in_raIdx, in_decIdx, in_nameIdx){

		this.#name = in_name;
		this.#metadata = in_metadata;
		this.#raIdx = in_raIdx;
		this.#decIdx = in_decIdx;
		this.#nameIdx = in_nameIdx;
		this.#gl = global.gl;
		this.#shaderProgram = this.#gl.createProgram();
		this.#vertexCataloguePositionBuffer = this.#gl.createBuffer();
		this.#vertexIndexBuffer = {
				"itemSize": 3,
				"numItems": 0
		};
			
		this.initShaders();
		
	}
	
	
	
	
	initShaders(){
		
		var self = this;
		var gl = this.#gl;
		var shaderProgram = this.#shaderProgram;
		
		var fragmentShader = this.loadShaderFromDOM("cat-shader-fs");
		var vertexShader = this.loadShaderFromDOM("cat-shader-vs");
		
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		gl.useProgram(shaderProgram);

		// TODO USELESS
		this.setUniformLocation();
		
	}
	
	
	loadShaderFromDOM(shaderId) {
		var gl = this.#gl;
		
	    var shaderScript = document.getElementById(shaderId);
	    
	    // If we don't find an element with the specified id
	    // we do an early exit 
	    if (!shaderScript) {
	    	return null;
	    }
	    
	    // Loop through the children for the found DOM element and
	    // build up the shader source code as a string
	    var shaderSource = "";
	    var currentChild = shaderScript.firstChild;
	    while (currentChild) {
	        if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
	      		shaderSource += currentChild.textContent;
	        }
	        currentChild = currentChild.nextSibling;
	    }
	    
	    var shader;
	    if (shaderScript.type == "x-shader/x-fragment") {
	    	shader = gl.createShader(gl.FRAGMENT_SHADER);
	    } else if (shaderScript.type == "x-shader/x-vertex") {
	    	shader = gl.createShader(gl.VERTEX_SHADER);
	    } else {
	    	return null;
	    }
	    
	    gl.shaderSource(shader, shaderSource);
	    gl.compileShader(shader);
	    
	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    	alert(gl.getShaderInfoLog(shader));
	    	return null;
	    } 
	    return shader;
	}
	
	
	// TODO USELESS
	setUniformLocation(){
		
		var gl = this.#gl;
		var shaderProgram = this.#shaderProgram;

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	}
	
	
	get name(){
		return this.#name;
	}
	
	get sources(){
		return this.#sources;
	}
	
	addSource(in_source){
		this.#sources.push(in_source);
	}
	
	/**
	 * @param in_sources: it's the TAP response data object 
	 */
	addSources(in_data){
		var j,
		point,
		source;
		
		for ( j = 0; j < in_data.length; j++){
			
			point = new Point({
				"raDeg": in_data[j][this.#raIdx],
				"decDeg": in_data[j][this.#decIdx]
			}, CoordsType.ASTRO);
			
			source = new Source(point, in_data[j][this.#nameIdx], in_data[j]);
			this.addSource(source);
		}
		this.initBuffer();
	}
	
	
	
	
	initBuffer () {

		var gl = this.#gl;
		var vertexCataloguePositionBuffer = this.#vertexCataloguePositionBuffer;
		var sources = this.#sources;
		var vertexIndexBuffer = this.#vertexIndexBuffer;
			
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCataloguePositionBuffer);
		var nSources = sources.length;
		var vertexCataloguePosition = new Float32Array(nSources*3);
		var positionIndex = 0;
//			var epsilon = 0.00000001;
		var epsilon = 0.0;
		for(var j = 0; j < nSources; j++){
			
			vertexCataloguePosition[positionIndex] = sources[j].point.x + epsilon;
			vertexCataloguePosition[positionIndex+1] = sources[j].point.y + epsilon;
			vertexCataloguePosition[positionIndex+2] = sources[j].point.z + epsilon;
			positionIndex +=3;
			
		}

		gl.bufferData(gl.ARRAY_BUFFER, vertexCataloguePosition, gl.STATIC_DRAW);
		vertexIndexBuffer.itemSize = 3;
		vertexIndexBuffer.numItems = vertexCataloguePosition.length/3;

	}
	
	enableShader(in_mMatrix){
		var shaderProgram = this.#shaderProgram;
		var gl = this.#gl;
		gl.useProgram(shaderProgram);
		

		shaderProgram.catUniformMVMatrixLoc = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.catUniformProjMatrixLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.vertexCatPositionAttributeLoc = gl.getAttribLocation(shaderProgram, 'aCatPosition');
		  
		var mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(global.camera.getCameraMatrix(), in_mMatrix, mvMatrix);
		gl.uniformMatrix4fv(shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		gl.uniformMatrix4fv(shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

	}
	
	/**
	 * @param in_Matrix: model matrix the current catalogue is associated to (e.g. HiPS matrix)
	 */
	draw(in_mMatrix){
		
		this.enableShader(in_mMatrix);
		
		var vertexIndexBuffer = this.#vertexIndexBuffer;
		var gl = this.#gl;
		var vertexCataloguePositionBuffer = this.#vertexCataloguePositionBuffer;
		var shaderProgram = this.#shaderProgram;

		
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCataloguePositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexCatPositionAttributeLoc, vertexIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vertexCatPositionAttributeLoc);
		gl.drawArrays(gl.POINTS, 0, vertexIndexBuffer.numItems);
		
	}

	
}

"use strict";
class Catalogue{
	
	static ELEM_SIZE = 5;
	static BYTES_X_ELEM = new Float32Array().BYTES_PER_ELEMENT;
	
	#name;
	#metadata;
	#raIdx;
	#decIdx;
	#nameIdx;
	#shaderProgram;
	#gl;
	#vertexCataloguePositionBuffer;
	#vertexSelectionCataloguePositionBuffer;
//	#vertexIndexBuffer;
	#sources = [];
	#oldMouseCoords;
	#vertexCataloguePosition;
	#attribLocations = {};
	
	
	constructor(in_name, in_metadata, in_raIdx, in_decIdx, in_nameIdx){

		this.#name = in_name;
		this.#metadata = in_metadata;
		this.#raIdx = in_raIdx;
		this.#decIdx = in_decIdx;
		this.#nameIdx = in_nameIdx;
		this.#gl = global.gl;
		this.#shaderProgram = this.#gl.createProgram();
		this.#vertexCataloguePositionBuffer = this.#gl.createBuffer();
		this.#vertexSelectionCataloguePositionBuffer = this.#gl.createBuffer();
		
		this.#vertexCataloguePosition = [];
		
		this.#oldMouseCoords = null;
		
		this.#attribLocations = {
				position: 0,
				selected: 1,
				pointSize: 2
		};
		
//		this.#vertexIndexBuffer = {
//				"itemSize": 3,
//				"numItems": 0
//		};
			
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
			
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexCataloguePositionBuffer);
		var nSources = sources.length;

		this.#vertexCataloguePosition = new Float32Array( nSources * Catalogue.ELEM_SIZE );
		var positionIndex = 0;
		var epsilon = 0.0;
		for(var j = 0; j < nSources; j++){
			
			this.#vertexCataloguePosition[positionIndex] = sources[j].point.x + epsilon;
			this.#vertexCataloguePosition[positionIndex+1] = sources[j].point.y + epsilon;
			this.#vertexCataloguePosition[positionIndex+2] = sources[j].point.z + epsilon;
			this.#vertexCataloguePosition[positionIndex+3] = 0.0;
			this.#vertexCataloguePosition[positionIndex+4] = 3.0;
			
			positionIndex += Catalogue.ELEM_SIZE;
			
		}

	}
	
	
	
	
	checkSelection (in_mouseCoords) {
		var sources = this.#sources;
		var nSources = sources.length;
		var selectionIndexes = [];
		
		for(var j = 0; j < nSources; j++){
			let sourcexyz = [sources[j].point.x , sources[j].point.y , sources[j].point.z];
			
			let dist = Math.sqrt( (sourcexyz[0] - in_mouseCoords[0] )*(sourcexyz[0] - in_mouseCoords[0] ) + (sourcexyz[1] - in_mouseCoords[1] )*(sourcexyz[1] - in_mouseCoords[1] ) + (sourcexyz[2] - in_mouseCoords[2] )*(sourcexyz[2] - in_mouseCoords[2] ) );
			if (dist <= 0.002){
				
				console.log("Source found");
				console.log(sources[j]);
				
				selectionIndexes.push(j);
					
			}
		}
		return selectionIndexes;
		
	}
	
	

	
	enableShader(in_mMatrix){
		var shaderProgram = this.#shaderProgram;

		this.#shaderProgram.catUniformMVMatrixLoc = this.#gl.getUniformLocation(this.#shaderProgram, "uMVMatrix");
		this.#shaderProgram.catUniformProjMatrixLoc = this.#gl.getUniformLocation(this.#shaderProgram, "uPMatrix");
		
		this.#attribLocations.position  = this.#gl.getAttribLocation(this.#shaderProgram, 'aCatPosition');
		
		this.#attribLocations.selected  = this.#gl.getAttribLocation(this.#shaderProgram, 'a_selected');

		this.#attribLocations.pointSize = this.#gl.getAttribLocation(this.#shaderProgram, 'a_PointSize');
				  
		var mvMatrix = mat4.create();
		mvMatrix = mat4.multiply(global.camera.getCameraMatrix(), in_mMatrix, mvMatrix);
		this.#gl.uniformMatrix4fv(this.#shaderProgram.catUniformMVMatrixLoc, false, mvMatrix);
		this.#gl.uniformMatrix4fv(this.#shaderProgram.catUniformProjMatrixLoc, false, global.pMatrix);

	}
	
	/**
	 * @param in_Matrix: model matrix the current catalogue is associated to (e.g. HiPS matrix)
	 */
	draw(in_mMatrix, in_mouseCoords){
		

		this.#gl.useProgram(this.#shaderProgram);
		
		
		this.#vertexCataloguePositionBuffer = this.#gl.createBuffer();
		
		this.enableShader(in_mMatrix);
		
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#vertexCataloguePositionBuffer);
		
		this.#gl.vertexAttribPointer(this.#attribLocations.position, 3, this.#gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, 0);
		this.#gl.enableVertexAttribArray(this.#attribLocations.position);

		this.#gl.vertexAttribPointer(this.#attribLocations.selected, 1, this.#gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, Catalogue.BYTES_X_ELEM * 3);
		this.#gl.enableVertexAttribArray(this.#attribLocations.selected);

		this.#gl.vertexAttribPointer(this.#shaderProgram.pointSize, 1, this.#gl.FLOAT, false, Catalogue.BYTES_X_ELEM * Catalogue.ELEM_SIZE, Catalogue.BYTES_X_ELEM * 4);
		this.#gl.enableVertexAttribArray(this.#shaderProgram.pointSize);

		
		
		if (in_mouseCoords != null && in_mouseCoords != this.#oldMouseCoords){
//			gl.vertexAttribPointer(shaderProgram.vertexMousePositionAttributeLoc, vertexIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);
//			gl.enableVertexAttribArray(shaderProgram.vertexMousePositionAttributeLoc);
			/* - potrei usare il 4 elemento dell'array vertexCataloguePositionBuffer per la selezione. 1 = selezionato, 0 non selezionato
			 * - altra opzione sarebbe usare una struct nello shader del tipo: (check https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html)
			 * 		struct cat {
			 * 			vec4 pos;
			 * 			bool selected;
			 * 		}
			*/
			console.log(in_mouseCoords);
			let selectionIndexes = this.checkSelection(in_mouseCoords);
			for (var i = 0; i < selectionIndexes.length; i++){
				console.log(this.#sources[selectionIndexes[i]]);
			}
			
			for (var i = 0; i < selectionIndexes.length; i++) {
				
				this.#vertexCataloguePosition[ (selectionIndexes[i] * Catalogue.ELEM_SIZE) + 3] = 1.0;
				
			}
			
			
		}
		this.#gl.bufferData(this.#gl.ARRAY_BUFFER, this.#vertexCataloguePosition, this.#gl.STATIC_DRAW);
		

		var numItems = this.#vertexCataloguePosition.length/Catalogue.ELEM_SIZE;

		this.#gl.drawArrays(this.#gl.POINTS, 0, numItems);

		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
		this.#oldMouseCoords = in_mouseCoords;
		
	}

	
}

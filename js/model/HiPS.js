/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */

function HiPS(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
	
	AbstractSkyEntity.call(this, in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils);
	var currentObj = this;
	console.log(currentObj);

	this.localInit = function(){
		
		currentObj.pixels = [];
		
		currentObj.opacity = 1.00 * 100.0/100.0;
		
		currentObj.norder = 3;
		currentObj.nside = Math.pow(2, currentObj.norder);
		currentObj.healpix = new Healpix(currentObj.nside);
		currentObj.maxNPix = currentObj.healpix.getNPix();
		
		currentObj.URL = "http://skies.esac.esa.int/DSSColor/";
		currentObj.maxOrder = 9;
		
	};
	
	this.initShaders = function () {
		var fragmentShader = getShader("hips-shader-fs");
		var vertexShader = getShader("hips-shader-vs");

		in_gl.attachShader(currentObj.shaderProgram, vertexShader);
		in_gl.attachShader(currentObj.shaderProgram, fragmentShader);
		in_gl.linkProgram(currentObj.shaderProgram);

		if (!in_gl.getProgramParameter(currentObj.shaderProgram, in_gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		in_gl.useProgram(currentObj.shaderProgram);

		currentObj.shaderProgram.vertexPositionAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aVertexPosition");
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);

		currentObj.shaderProgram.textureCoordAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aTextureCoord");
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.textureCoordAttribute);

//		currentObj.shaderProgram.pMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uPMatrix");
//		currentObj.shaderProgram.mMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uMMatrix");
//		currentObj.shaderProgram.vMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uVMatrix");
//		currentObj.shaderProgram.samplerUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uSampler0");
//		currentObj.shaderProgram.uniformVertexTextureFactor = in_gl.getUniformLocation(currentObj.shaderProgram, "uFactor0");
//		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, 1.0);
		currentObj.setUniformLocation(); 
		
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

		currentObj.shaderProgram.pMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uPMatrix");
		currentObj.shaderProgram.mMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uMMatrix");
		currentObj.shaderProgram.vMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uVMatrix");
		currentObj.shaderProgram.samplerUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uSampler0");
		currentObj.shaderProgram.uniformVertexTextureFactor = in_gl.getUniformLocation(currentObj.shaderProgram, "uFactor0");
		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, 1.0);

	};
	
	this.refreshBuffers = function(){
		
		currentObj.shaderProgram.vertexPositionAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aVertexPosition");
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);

		currentObj.shaderProgram.textureCoordAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aTextureCoord");
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.textureCoordAttribute);
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexPositionBuffer);
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexTextureCoordBuffer); 
		
	    in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, currentObj.vertexIndexBuffer);
        
	};
	
	this.initBuffer = function () {
		
		var nPixels = currentObj.pixels.length;
		var vertexPosition = new Float32Array(12*nPixels);

		var facesVec3Array;
		var p = [];
		
		var theta0, theta1, theta2, theta3;
		var phi0, phi1, phi2, phi3;
		
		var epsilon = 0.0;
		for (var i=0; i < nPixels; i++){
			facesVec3Array = new Array();
			facesVec3Array = currentObj.healpix.getBoundaries(currentObj.pixels[i]);
			
			
			if (currentObj.radius != 1){
				// HiPS radius different from Healpix default radius 1. 
				// Mapping HEALPix coordinates to the new sphere and radius
				theta0 = Math.acos(facesVec3Array[0].z);
				theta1 = Math.acos(facesVec3Array[1].z);
				theta2 = Math.acos(facesVec3Array[2].z);
				theta3 = Math.acos(facesVec3Array[3].z);
				
				phi0 = Math.atan2(facesVec3Array[0].y, facesVec3Array[0].x);
				phi1 = Math.atan2(facesVec3Array[1].y, facesVec3Array[1].x);
				phi2 = Math.atan2(facesVec3Array[2].y, facesVec3Array[2].x);
				phi3 = Math.atan2(facesVec3Array[3].y, facesVec3Array[3].x);
				
				vertexPosition[12*i] = currentObj.radius * Math.sin(theta0) * Math.cos(phi0);
				vertexPosition[12*i+1] = currentObj.radius * Math.sin(theta0) * Math.sin(phi0);
				vertexPosition[12*i+2] = currentObj.radius * Math.cos(theta0);
				
				vertexPosition[12*i+3] = currentObj.radius * Math.sin(theta1) * Math.cos(phi1);
				vertexPosition[12*i+4] = currentObj.radius * Math.sin(theta1) * Math.sin(phi1);
				vertexPosition[12*i+5] = currentObj.radius * Math.cos(theta1);
				
				vertexPosition[12*i+6] = currentObj.radius * Math.sin(theta2) * Math.cos(phi2);
				vertexPosition[12*i+7] = currentObj.radius * Math.sin(theta2) * Math.sin(phi2);
				vertexPosition[12*i+8] = currentObj.radius * Math.cos(theta2);
				
				vertexPosition[12*i+9] = currentObj.radius * Math.sin(theta3) * Math.cos(phi3);
				vertexPosition[12*i+10] = currentObj.radius * Math.sin(theta3) * Math.sin(phi3);
				vertexPosition[12*i+11] = currentObj.radius * Math.cos(theta3);
				
			}else{
				// Default Healpix radius 1
				vertexPosition[12*i] = facesVec3Array[0].x ;
				vertexPosition[12*i+1] = facesVec3Array[0].y ;
				vertexPosition[12*i+2] = facesVec3Array[0].z;
				
				vertexPosition[12*i+3] = facesVec3Array[1].x;
				vertexPosition[12*i+4] = facesVec3Array[1].y;
				vertexPosition[12*i+5] = facesVec3Array[1].z;
				
				vertexPosition[12*i+6] = facesVec3Array[2].x;
				vertexPosition[12*i+7] = facesVec3Array[2].y;
				vertexPosition[12*i+8] = facesVec3Array[2].z;
				
				vertexPosition[12*i+9] = facesVec3Array[3].x;
				vertexPosition[12*i+10] = facesVec3Array[3].y;
				vertexPosition[12*i+11] = facesVec3Array[3].z;
				
			}
		}
		
		
		var textureCoordinates = new Float32Array(8*nPixels);
	    if (currentObj.fovUtils.getMinFoV() >= 50){
	    	//0.037037037
	    	var s_step=1/27;
	    	//0.034482759
	    	var t_step=1/29;
	    	
	    	var sindex = 0;
	    	var tindex = 0;
	    	for (var i=0; i < nPixels; i++){
	    		// AllSky map. One map texture
	        	// [1, 0],[1, 1],[0, 1],[0, 0]
	        	textureCoordinates[8*i] = (s_step + (s_step * sindex)).toFixed(9);
	        	textureCoordinates[8*i+1] = (1 - (t_step + t_step * tindex)).toFixed(9);
	        	textureCoordinates[8*i+2] = (s_step + (s_step * sindex)).toFixed(9);
	        	textureCoordinates[8*i+3] = (1 - (t_step * tindex)).toFixed(9);
	        	textureCoordinates[8*i+4] = (s_step * sindex).toFixed(9);
	        	textureCoordinates[8*i+5] = (1 - (t_step * tindex)).toFixed(9);
	        	textureCoordinates[8*i+6] = (s_step * sindex).toFixed(9);
	        	textureCoordinates[8*i+7] = (1 - (t_step + t_step * tindex)).toFixed(9);
	        	sindex++;
	        	if(sindex == 27){
	        		tindex++;
	        		sindex=0;
	        	}
	        }
	    }else{
	    	for (var i=0; i < nPixels; i++){
	        	// [1, 0],[1, 1],[0, 1],[0, 0]
	        	textureCoordinates[8*i] = 1.0;
	        	textureCoordinates[8*i+1] = 0.0;
	        	textureCoordinates[8*i+2] = 1.0;
	        	textureCoordinates[8*i+3] = 1.0;
	        	textureCoordinates[8*i+4] = 0.0;
	        	textureCoordinates[8*i+5] = 1.0;
	        	textureCoordinates[8*i+6] = 0.0;
	        	textureCoordinates[8*i+7] = 0.0;

	        }
	    }		
		
	    var vertexIndices = new Uint16Array(6*nPixels);
	    var baseFaceIndex = 0; 
	    for (var j=0; j< nPixels; j++){
	    	
	    	vertexIndices[6*j] = baseFaceIndex;
	    	vertexIndices[6*j+1] = baseFaceIndex + 1;
	    	vertexIndices[6*j+2] = baseFaceIndex + 2;
	    	
	    	vertexIndices[6*j+3] = baseFaceIndex;
	    	vertexIndices[6*j+4] = baseFaceIndex + 2;
	    	vertexIndices[6*j+5] = baseFaceIndex + 3;
	    		
	    	baseFaceIndex = baseFaceIndex+4;
	    	
	    }
	    
		currentObj.vertexPositionBuffer = in_gl.createBuffer();
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexPositionBuffer);
		in_gl.bufferData(in_gl.ARRAY_BUFFER, vertexPosition, in_gl.STATIC_DRAW);
		currentObj.vertexPositionBuffer.itemSize = 3;
	    currentObj.vertexPositionBuffer.numItems = vertexPosition.length;
		
		currentObj.vertexTextureCoordBuffer = in_gl.createBuffer();
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexTextureCoordBuffer); 
		in_gl.bufferData(in_gl.ARRAY_BUFFER, textureCoordinates, in_gl.STATIC_DRAW);
		currentObj.vertexTextureCoordBuffer.itemSize = 2;
		currentObj.vertexTextureCoordBuffer.numItems = textureCoordinates.length;
	    
		
	    currentObj.vertexIndexBuffer = in_gl.createBuffer();
	    in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, currentObj.vertexIndexBuffer);
	    in_gl.bufferData(in_gl.ELEMENT_ARRAY_BUFFER, vertexIndices, in_gl.STATIC_DRAW);
	    currentObj.vertexIndexBuffer.itemSize = 1;
	    currentObj.vertexIndexBuffer.numItems = vertexIndices.length;
	    
	};
	
	this.initTexture = function () {
	    
		currentObj.textures[0] = in_gl.createTexture();
		
		currentObj.textures[0].image = new Image();
		currentObj.textures[0].image.setAttribute('crossorigin', 'anonymous');
	    
		currentObj.textures[0].image.onload = function () {
	        
	    	handleLoadedTexture(currentObj.textures[0], 0);
	    
	    };
	    
	    currentObj.textures[0].image.src = currentObj.URL+"/Norder3/Allsky.jpg";
	    
	    function handleLoadedTexture (texture, shaderSkyIndex){
			
	        texture.image.setAttribute('crossorigin', 'anonymous');
			
	        in_gl.activeTexture(in_gl.TEXTURE0+shaderSkyIndex);
	        
			in_gl.pixelStorei(in_gl.UNPACK_FLIP_Y_WEBGL, true);
			in_gl.bindTexture(in_gl.TEXTURE_2D, texture);			
			in_gl.texImage2D(in_gl.TEXTURE_2D, 0, in_gl.RGBA, in_gl.RGBA, in_gl.UNSIGNED_BYTE, texture.image);
			
			if (currentObj.fovUtils.getMinFoV() >= 50){
				// it's not a power of 2. Turn off mip and set wrapping to clamp to edge
				in_gl.texParameteri(in_gl.TEXTURE_2D, in_gl.TEXTURE_WRAP_S, in_gl.CLAMP_TO_EDGE);
				in_gl.texParameteri(in_gl.TEXTURE_2D, in_gl.TEXTURE_WRAP_T, in_gl.CLAMP_TO_EDGE);
				in_gl.texParameteri(in_gl.TEXTURE_2D, in_gl.TEXTURE_MIN_FILTER, in_gl.LINEAR);
			    
			}else{
				in_gl.generateMipmap(in_gl.TEXTURE_2D);
				in_gl.texParameteri(in_gl.TEXTURE_2D, in_gl.TEXTURE_MAG_FILTER, in_gl.NEAREST);
				in_gl.texParameteri(in_gl.TEXTURE_2D, in_gl.TEXTURE_MIN_FILTER, in_gl.NEAREST);
			}
			
			// TODO REVIEW uniformSamplerLoc[shaderSkyIndex] !!!
			in_gl.uniform1i(currentObj.shaderProgram.samplerUniform, shaderSkyIndex);

			if (!in_gl.isTexture(texture)){
		    	console.log("error in texture");
		    }
			in_gl.bindTexture(in_gl.TEXTURE_2D, null);
	        
		}
	};
	
	this.computeVisiblePixels = function(){
		for (var i=0; i<768;i++){
			currentObj.pixels.push(i);
		}
	};
	
	this.draw = function(pMatrix, vMatrix){

		in_gl.useProgram(currentObj.shaderProgram);
		
		currentObj.shaderProgram.pMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uPMatrix");
		currentObj.shaderProgram.mMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uMMatrix");
		currentObj.shaderProgram.vMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uVMatrix");
		currentObj.shaderProgram.samplerUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uSampler0");
		currentObj.shaderProgram.uniformVertexTextureFactor = in_gl.getUniformLocation(currentObj.shaderProgram, "uFactor0");
		currentObj.shaderProgram.vertexPositionAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aVertexPosition");
		currentObj.shaderProgram.textureCoordAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aTextureCoord");

		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, 1.0);		
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.mMatrixUniform, false, currentObj.modelMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.pMatrixUniform, false, pMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.vMatrixUniform, false, vMatrix);
		
		
		in_gl.activeTexture(in_gl.TEXTURE0);
		in_gl.bindTexture(in_gl.TEXTURE_2D, currentObj.textures[0]);
		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, currentObj.opacity);
		
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexPositionBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, currentObj.vertexPositionBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexTextureCoordBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.textureCoordAttribute, currentObj.vertexTextureCoordBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, currentObj.vertexIndexBuffer);
		
	    in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.textureCoordAttribute);

	    for (var i=0;i<currentObj.pixels.length;i++){
	    	in_gl.drawElements(in_gl.TRIANGLES, 6, in_gl.UNSIGNED_SHORT, 12*i);
        }	
		
	};
	
	this.drawBK = function(){
//		if (id == 0){
//			console.log("HiPS Model");
//			console.log(currentObj);
//			console.log("HiPS pixel length "+currentObj.pixels.length);
//		}
//	    id = 1;
	    
		in_gl.useProgram(currentObj.shaderProgram);
	    currentObj.setUniformLocation();
	    
	    currentObj.refreshBuffers();
	    
	    in_gl.uniformMatrix4fv(currentObj.shaderProgram.mMatrixUniform, false, currentObj.modelMatrix);

	    
		in_gl.activeTexture(in_gl.TEXTURE0);
		in_gl.bindTexture(in_gl.TEXTURE_2D, currentObj.textures[0]);
		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, currentObj.opacity);

		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexPositionBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, currentObj.vertexPositionBuffer.itemSize, in_gl.FLOAT, false, 0, 0);	    
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexTextureCoordBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.textureCoordAttribute, currentObj.vertexTextureCoordBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, currentObj.vertexIndexBuffer);

	    for (var i=0;i<currentObj.pixels.length;i++){
	    	in_gl.drawElements(in_gl.TRIANGLES, 6, in_gl.UNSIGNED_SHORT, 12*i);
        }
	    
	};
	
	
	var id = 0;
	this.localInit();
	this.computeVisiblePixels();
	this.initShaders();
	this.initBuffer();
	this.initTexture();
	

}
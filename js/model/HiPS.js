/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */

function HiPS(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
	
	AbstractSkyEntity.call(this, in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils);
	var currentObj = this;

	this.localInit = function(){
		
		currentObj.radius = in_radius;
		
		currentObj.updateOnFoV = true;
		
		currentObj.pixels = [];
		currentObj.pixelsCache = [];
		
		currentObj.opacity = 1.00 * 100.0/100.0;
		
		currentObj.norder = 3;
		currentObj.prevNorder = currentObj.norder;
		currentObj.texturesNeedRefresh = false; // true when changing HiPS or changing nside
		
		var nside = Math.pow(2, currentObj.norder);
		currentObj.healpix = new Healpix(nside);
		currentObj.maxNPix = currentObj.healpix.getNPix();
		
		currentObj.URL = "http://skies.esac.esa.int/DSSColor/";
		currentObj.maxOrder = 9;
		
		currentObj.sphericalGrid = false;
		currentObj.xyzRefCoord = false;
		currentObj.equatorialGrid = false;
		
		// below this value we switch from AllSky to HEALPix geometry/texture
		currentObj.allskyFovLimit = 50.0;
		
		currentObj.sphericalGrid = new SphericalGrid(1.004, in_gl);
		
		currentObj.xyzRefSystem = new XYZSystem(in_gl);
		
		currentObj.textures = [];
		currentObj.textures.images = [];
		
//		console.log("[HiPS::localInit] currentObj.textures.images "+currentObj.textures.images)
		
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
	
	this.initBuffer = function () {
		
		
//		console.log("[HiPS::initBuffer]");
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
				
				vertexPosition[12*i] = -currentObj.radius * Math.sin(theta0) * Math.cos(phi0);
				vertexPosition[12*i+1] = currentObj.radius * Math.sin(theta0) * Math.sin(phi0);
				vertexPosition[12*i+2] = currentObj.radius * Math.cos(theta0);
				
				vertexPosition[12*i+3] = -currentObj.radius * Math.sin(theta1) * Math.cos(phi1);
				vertexPosition[12*i+4] = currentObj.radius * Math.sin(theta1) * Math.sin(phi1);
				vertexPosition[12*i+5] = currentObj.radius * Math.cos(theta1);
				
				vertexPosition[12*i+6] = -currentObj.radius * Math.sin(theta2) * Math.cos(phi2);
				vertexPosition[12*i+7] = currentObj.radius * Math.sin(theta2) * Math.sin(phi2);
				vertexPosition[12*i+8] = currentObj.radius * Math.cos(theta2);
				
				vertexPosition[12*i+9] = -currentObj.radius * Math.sin(theta3) * Math.cos(phi3);
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
		
//		console.log("[HiPS::initBuffer] currentObj.radius "+currentObj.radius ); 
//		console.log("[HiPS::initBuffer] currentObj.pixels.length "+nPixels );
//		console.log("[HiPS::initBuffer] currentObj.fovObj.getMinFoV() "+currentObj.fovObj.getMinFoV() );
//		console.log("[HiPS::initBuffer] AllSky? "+ (currentObj.fovObj.getMinFoV()>= currentObj.allskyFovLimit) );
		
		var textureCoordinates = new Float32Array(8*nPixels);
	    if (currentObj.fovObj.getMinFoV() >= currentObj.allskyFovLimit){ // AllSky
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
	        	// UV mapping: 1, 0],[1, 1],[0, 1],[0, 0]
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
	    
		if (currentObj.fovObj.getMinFoV() >= currentObj.allskyFovLimit){ // AllSky
			
			currentObj.textures = in_gl.createTexture();
			
			if (currentObj.textures.images === undefined){
				currentObj.textures.images = [];
			}
			currentObj.textures.images[0] = in_gl.createTexture();
			
			currentObj.textures.images[0].image = new Image();
		    
			currentObj.textures.images[0].image.onload = function () {
		        
		    	handleLoadedTexture(currentObj.textures.images[0], 0);
		    
		    };
		    
		    currentObj.textures.images[0].image.setAttribute('crossorigin', 'anonymous');
		    currentObj.textures.images[0].image.setAttribute('crossOrigin', 'anonymous');
		    currentObj.textures.images[0].image.crossOrigin = "anonymous";
		    currentObj.textures.images[0].image.src = currentObj.URL+"/Norder3/Allsky.jpg";
		    		    
		}else{
			
			if (currentObj.textures.images === undefined){
				currentObj.textures.images = [];
			}
			if (currentObj.textures.cache === undefined){
				currentObj.textures.cache = [];
			}
			
			if (currentObj.texturesNeedRefresh){
				console.log("[HiPS::initTexture] refreshing texture below AllSkyLimit");
				
				for (var d=0; d < currentObj.textures.images.length; d++){
					in_gl.deleteTexture(currentObj.textures.images[d]);
				}
				
				currentObj.textures.images.splice(0, currentObj.textures.images.length);
				currentObj.textures.cache.splice(0, currentObj.textures.cache.length);
				currentObj.texturesNeedRefresh = false;
				
			}
			
			
			
			for (var n=0; n < currentObj.pixels.length;n++){
				
				var texCacheIdx = currentObj.pixelsCache.indexOf(currentObj.pixels[n]);
				if (texCacheIdx !== -1 &&  currentObj.textures.cache[texCacheIdx] !== undefined){
				
					console.log("[HiPS::initTexture] from cache "+currentObj.textures.cache[texCacheIdx]);
					console.log("[HiPS::initTexture] cache idx "+texCacheIdx);
					
					currentObj.textures.images[n] = in_gl.createTexture();
					currentObj.textures.images[n] = currentObj.textures.cache[texCacheIdx];
					
				}else{

					currentObj.textures.images[n] = in_gl.createTexture();
									
					currentObj.textures.images[n].image = new Image();
					currentObj.textures.images[n].image.n = n;
					var dirNumber = Math.floor(currentObj.pixels[n] / 10000) * 10000;

					currentObj.textures.images[n].image.onload = function () {
				        
						handleLoadedTexture(currentObj.textures.images[this.n], 0, this.n);
				    
				    };
				    
				    currentObj.textures.images[n].image.setAttribute('crossorigin', 'anonymous');
				    currentObj.textures.images[n].image.setAttribute('crossOrigin', 'anonymous');
				    currentObj.textures.images[n].image.crossOrigin = "anonymous";
				    currentObj.textures.images[n].image.src = currentObj.URL+"/Norder"+currentObj.norder+"/Dir"+dirNumber+"/Npix"+currentObj.pixels[n]+".jpg";
				}
				
				
//				// TODO integrate a gl_texture cache
//				currentObj.textures.images[n] = in_gl.createTexture();
//								
//				currentObj.textures.images[n].image = new Image();
//				currentObj.textures.images[n].image.n = n;
//				var dirNumber = Math.floor(currentObj.pixels[n] / 10000) * 10000;
////				console.log("[HiPS::initTexture] n "+n);
////				console.log("[HiPS::initTexture] pixel number  (BEFORE) "+currentObj.pixels[n]);
//				
//				currentObj.textures.images[n].image.onload = function () {
//			        
//					handleLoadedTexture(currentObj.textures.images[this.n], 0, this.n);
//			    
//			    };
//			    
//			    currentObj.textures.images[n].image.setAttribute('crossorigin', 'anonymous');
//			    currentObj.textures.images[n].image.setAttribute('crossOrigin', 'anonymous');
//			    currentObj.textures.images[n].image.crossOrigin = "anonymous";
//			    currentObj.textures.images[n].image.src = currentObj.URL+"/Norder"+currentObj.norder+"/Dir"+dirNumber+"/Npix"+currentObj.pixels[n]+".jpg";
//			    console.log("n="+n+" image.src="+currentObj.textures.images[n].image.src);
			    
			}
			currentObj.textures.cache = currentObj.textures.images.slice();
			
		}
		
	    
	    function handleLoadedTexture (gl_texture, shaderSkyIndex, idx){
			
//	    	console.log("handleLoadedTexture");
//	    	console.log(gl_texture);
	        in_gl.activeTexture(in_gl.TEXTURE0+shaderSkyIndex);
	        
			in_gl.pixelStorei(in_gl.UNPACK_FLIP_Y_WEBGL, true);
			in_gl.bindTexture(in_gl.TEXTURE_2D, gl_texture);
			try{
				in_gl.texImage2D(in_gl.TEXTURE_2D, 0, in_gl.RGBA, in_gl.RGBA, in_gl.UNSIGNED_BYTE, gl_texture.image);	
			}catch(error){
				console.error(error);
				console.error("idx: "+idx+" currentObj.pixels[idx] "+currentObj.pixels[idx]);
				console.error(currentObj.pixels);
			}
			
			
			if (currentObj.fovObj.getMinFoV() >= currentObj.allskyFovLimit){
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

			if (!in_gl.isTexture(gl_texture)){
		    	console.log("error in texture");
		    }
			in_gl.bindTexture(in_gl.TEXTURE_2D, null);
	        
		}
	};
	
	
	/* 
	 * -it takes the (0,0,sphereRadius) vector
	 * -rotate it using camera rotation (inverse?)
	 * -compute the central pixel numnber
	 * -check if it is already into the pixels in  currentObj.pixels
	 * -divides the the clip space in a grid 8x8
	 * -??? multiply by 1/zoom??? -> camera translation???
	 * -convert the world coords into model
	 * -rotate model coords by camera rotation
	 * -compute pixels numbers from rotated model coords and add them to currentObj.pixels
	 */ 
	this.updateVisiblePixels = function(
			in_camerObj, in_pMatrix, 
			in_canvas, 
			in_rayPickingObj){
		
		
		
		
		if (currentObj.getMinFoV() >= currentObj.allskyFovLimit) {
			console.log("[HiPS::updateVisiblePixels] ocomputing all pixels for AllSky");
			this.computePixels();
		}else{
			
			currentObj.pixelsCache = currentObj.pixels.slice();
			currentObj.pixels.splice(0, currentObj.pixels.length);
			
			// Model point having only Z as radius
			var modelZPoint = [in_position[0], in_position[1], in_position[2] + currentObj.radius , 1.0];
			
			mat4.multiplyVec4(in_camerObj.getCameraMatrix(), modelZPoint, modelZPoint);
			
			var maxX = in_canvas.width;
			var maxY = in_canvas.height;

//			currentObj.pixels.splice(0, currentObj.pixels.length);
			var xy = [];
			var neighbours = [];
			
			// TODO probably it would be better to use query_disc_inclusive from HEALPix 
			// against a polygon. Check my FHIPSWebGL2 project (BufferManager.js -> updateVisiblePixels)
			for (var i =0; i <= maxX; i+=maxX/8){
				for (var j =0; j <= maxY; j+=maxY/8){
					
					xy = [i,j];

					intersectionWithModel = in_rayPickingObj.getIntersectionPointWithSingleModel(
							xy[0], 
							xy[1], 
							in_pMatrix, 
							in_camerObj, 
							in_canvas, 
							currentObj
							);
					intersectionPoint = intersectionWithModel.intersectionPoint;

					if (intersectionPoint != undefined){
						currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));

						currPixNo = currentObj.healpix.ang2pix(currP);
						if (currPixNo >= 0){
							neighbours = currentObj.healpix.neighbours(currPixNo);
							if (currentObj.pixels.indexOf(currPixNo) == -1){
								currentObj.pixels.push(currPixNo);
							}
							for (var k=0; k<neighbours.length; k++){
								if (currentObj.pixels.indexOf(neighbours[k]) == -1){
									if(neighbours[k] >= 0){
										currentObj.pixels.push(neighbours[k]);	
									}
								}
							}	
						}
						
					}
					
					
				}
			}	
//			console.log("[HiPS::updateVisiblePixels] new pixels length "+currentObj.pixels.length);
//			console.log("[HiPS::updateVisiblePixels] new pixels ids "+currentObj.pixels.sort());
		}
		
	
		
	};
	
	
	// TODO pass the norder. If the norder is lower than 3 (FoV greather than 32 degrees), then use 768 pixels (norder=3),
	// otherwise compute the pixels number 
	this.computePixels = function(){
		
		currentObj.pixels.splice(0, currentObj.pixels.length);
		for (var i=0; i < currentObj.maxNPix;i++){
			currentObj.pixels.push(i);
		}
		
	};
	
	
	
	this.refreshModel = function(
			in_fov, in_pan, 
			in_camerObj, in_pMatrix, 
			in_canvas, 
			in_rayPickingObj
			){
		
		console.log("[HiPS::refreshModel]");
		
		
		if (in_pan && in_fov < currentObj.allskyFovLimit){
//			nside = Math.pow(2, cnorder);
//			currentObj.healpix = new Healpix(nside);
//			currentObj.maxNPix = currentObj.healpix.getNPix();
//			currentObj.norder = cnorder;
			
			currentObj.texturesNeedRefresh = false;
			currentObj.updateVisiblePixels(
					in_camerObj, in_pMatrix, 
					in_canvas, 
					in_rayPickingObj
					);
			currentObj.initBuffer();
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// THIS ONE SHOULD GO INTO DRAW!!!!!!!
			// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			currentObj.initTexture();
		}else{
			var nside, cnorder;
			
//			if (!in_pan){ // only zoom in/out
				
			if ( in_fov >= 32){
				cnorder = 3;
			}else if (in_fov < 32 && in_fov >= 16){
				cnorder = 4;
			}else if (in_fov < 16 && in_fov >= 8){
				cnorder = 5;
			}else if (in_fov < 8 && in_fov >= 4){
				cnorder = 6;
			}else if (in_fov < 4 && in_fov >= 2){
				cnorder = 7;
			}else if (in_fov < 2 && in_fov >= 1){
				cnorder = 8;
			}else if (in_fov < 1 && in_fov >= 0.5){
				cnorder = 9;
			}else if (in_fov < 0.5 && in_fov >= 0.25){
				cnorder = 10;
			}else if (in_fov < 0.25 && in_fov >= 0.125){
				cnorder = 11;
			}else if (in_fov < 0.125){
				cnorder = 12;
			}
			
			
			var needsRefresh = (currentObj.norder != cnorder) || 
					(in_fov < currentObj.allskyFovLimit && currentObj.prevFoV >= currentObj.allskyFovLimit) || 
					(in_fov > currentObj.allskyFovLimit && currentObj.prevFoV <= currentObj.allskyFovLimit);
			
			if ( needsRefresh ){
				console.log("[HiPS::refreshModel] needsRefresh "+needsRefresh);
				
				currentObj.prevNorder = currentObj.norder;
				currentObj.texturesNeedRefresh = true;
				nside = Math.pow(2, cnorder);
				currentObj.healpix = new Healpix(nside);
				currentObj.maxNPix = currentObj.healpix.getNPix();
				currentObj.norder = cnorder;
				// TODO refresh geometry
				
				// panning and zoom in/out
				// compute visible pixels
				// update buffers
				// load textures

				currentObj.updateVisiblePixels(
						in_camerObj, in_pMatrix, 
						in_canvas, 
						in_rayPickingObj
						);
				currentObj.initBuffer();
				currentObj.initTexture();
			}	
		}
		
		
		
		
		
		
		
		currentObj.prevFoV = in_fov;
			
//		}else{
//			currentObj.updateVisiblePixels(
//					in_camerObj, in_pMatrix, 
//					in_canvas, 
//					in_rayPickingObj
//					);
//			currentObj.initBuffer();
//			currentObj.initTexture();
//		}
		
		
		
	};
	
	below = false;
	
	this.draw = function(pMatrix, vMatrix){

		in_gl.useProgram(currentObj.shaderProgram);
		
		currentObj.shaderProgram.pMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uPMatrix");
		currentObj.shaderProgram.mMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uMMatrix");
		currentObj.shaderProgram.vMatrixUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uVMatrix");
		currentObj.shaderProgram.samplerUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uSampler0");
		currentObj.shaderProgram.uniformVertexTextureFactor = in_gl.getUniformLocation(currentObj.shaderProgram, "uFactor0");
		currentObj.shaderProgram.sphericalGridEnabledUniform = in_gl.getUniformLocation(currentObj.shaderProgram, "uSphericalGrid");
		
		currentObj.shaderProgram.vertexPositionAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aVertexPosition");
		currentObj.shaderProgram.textureCoordAttribute = in_gl.getAttribLocation(currentObj.shaderProgram, "aTextureCoord");

		in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, 1.0);		
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.mMatrixUniform, false, currentObj.modelMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.pMatrixUniform, false, pMatrix);
		in_gl.uniformMatrix4fv(currentObj.shaderProgram.vMatrixUniform, false, vMatrix);
		
		currentObj.uniformVertexTextureFactorLoc = in_gl.getUniformLocation(currentObj.shaderProgram, "uFactor0");
		
		in_gl.uniform1f(currentObj.shaderProgram.sphericalGridEnabledUniform, 0.0);

				
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexPositionBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, currentObj.vertexPositionBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		in_gl.bindBuffer(in_gl.ARRAY_BUFFER, currentObj.vertexTextureCoordBuffer);
		in_gl.vertexAttribPointer(currentObj.shaderProgram.textureCoordAttribute, currentObj.vertexTextureCoordBuffer.itemSize, in_gl.FLOAT, false, 0, 0);
		
		in_gl.bindBuffer(in_gl.ELEMENT_ARRAY_BUFFER, currentObj.vertexIndexBuffer);
		
	    in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);
		in_gl.enableVertexAttribArray(currentObj.shaderProgram.textureCoordAttribute);

		
		
		// 4. draw
		if (currentObj.getMinFoV() >= currentObj.allskyFovLimit){ // AllSky
			in_gl.activeTexture(in_gl.TEXTURE0);
			in_gl.bindTexture(in_gl.TEXTURE_2D, currentObj.textures.images[0]);
			in_gl.uniform1f(currentObj.shaderProgram.uniformVertexTextureFactor, currentObj.opacity);
			
			
			if (below){
				console.log("Switched to AllSky on FoV "+currentObj.getMinFoV());
				below = false;
			}
			
		    for (var i=0;i<currentObj.pixels.length;i++){
		    	in_gl.drawElements(in_gl.TRIANGLES, 6, in_gl.UNSIGNED_SHORT, 12*i);
	        }
		    
		}else{
			
			if (!below){
				console.log("Switched to single textures on FoV "+currentObj.getMinFoV());
				below = true;
			}
			
			for (var i=0;i<currentObj.pixels.length;i++){
					
				in_gl.activeTexture(in_gl.TEXTURE0);
				in_gl.bindTexture(in_gl.TEXTURE_2D, currentObj.textures.images[i]);
				in_gl.uniform1f(currentObj.uniformVertexTextureFactorLoc, currentObj.opacity);
					
				in_gl.drawElements(in_gl.TRIANGLES, 6, 
						in_gl.UNSIGNED_SHORT, 12*i);
			}
			
		}
		if (currentObj.sphericalGrid) {
	    	currentObj.sphericalGrid.draw(currentObj.shaderProgram);
	    }
	    if (currentObj.equatorialGrid) {
	    	currentObj.drawEquatorialGrid();
	    }
	    
	    if (currentObj.xyzRefCoord){
			currentObj.xyzRefSystem.draw(currentObj.shaderProgram);	
		}
		

		
				
	};
	
	this.drawSphericalGrid = function(){
		
		var x, y, z;
		var r = 1.004;
		var thetaRad, phiRad;
		
		var thetaStep, phiStep;
		
		in_gl.uniform1f(currentObj.shaderProgram.sphericalGridEnabledUniform, 1.0);
		
		thetaStep = 10;
		phiStep = 10;
		
		for (var theta = 0; theta < 180; theta += thetaStep){
			
			var phiVertexPosition = new Float32Array(360/phiStep * 3);
			
			thetaRad = degToRad(theta);

			for (var phi = 0; phi <360; phi += phiStep){
				
				phiRad = degToRad(phi);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				phiVertexPosition[ 3 * (phi/phiStep)] = x; 
				phiVertexPosition[ 3 * (phi/phiStep) + 1] = y;
				phiVertexPosition[ 3 * (phi/phiStep) + 2] = z;
	
			}

			var phiVertexPositionBuffer = in_gl.createBuffer();
			in_gl.bindBuffer(in_gl.ARRAY_BUFFER, phiVertexPositionBuffer);
			in_gl.bufferData(in_gl.ARRAY_BUFFER, phiVertexPosition, in_gl.STATIC_DRAW);

			in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, 3, in_gl.FLOAT, false, 0, 0);

			in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);

			in_gl.drawArrays(in_gl.LINE_LOOP, 0, 360/phiStep);
		}
		

		thetaStep = 10;
		phiStep = 10;
		
		for (var phi = 0; phi <360; phi += phiStep){
			
			var thetaVertexPosition = new Float32Array(360/thetaStep * 3);
			
			phiRad = degToRad(phi);
			

			for (var theta = 0; theta <360; theta += thetaStep){
				
				thetaRad = degToRad(theta);
				
				x = r * Math.sin(thetaRad) * Math.cos(phiRad);
				y = r * Math.sin(thetaRad) * Math.sin(phiRad);
				z = r * Math.cos(thetaRad);
				
				
				thetaVertexPosition[ 3 * (theta/thetaStep)] = x; 
				thetaVertexPosition[ 3 * (theta/thetaStep) + 1] = y;
				thetaVertexPosition[ 3 * (theta/thetaStep) + 2] = z;
	
			}
			
			var thetaVertexPositionBuffer = in_gl.createBuffer();
			in_gl.bindBuffer(in_gl.ARRAY_BUFFER, thetaVertexPositionBuffer);
			in_gl.bufferData(in_gl.ARRAY_BUFFER, thetaVertexPosition, in_gl.STATIC_DRAW);

			in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, 3, in_gl.FLOAT, false, 0, 0);

			in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);

			in_gl.drawArrays(in_gl.LINE_LOOP, 0, 360/thetaStep);

		}
			
			
			var versors = [
				[1.5, 0.0, 0.0],
				[0.0, 1.5, 0.0],
				[0.0, 0.0, 1.5],
				];
			
			var refSysPosition = new Float32Array(3 * 2);
			
			refSysPosition[0] = 0.0;
			refSysPosition[1] = 0.0;
			refSysPosition[2] = 0.0;
			
			/*
			 * x red
			 * y green
			 * z blue
			 */
			for (var k=0; k<3; k++){
				
				in_gl.uniform1f(currentObj.shaderProgram.sphericalGridEnabledUniform, k + 2.0);
				
				refSysPosition[3] = versors[k][0];
				refSysPosition[4] = versors[k][1];
				refSysPosition[5] = versors[k][2];
				
				var refSysPositionBuffer = in_gl.createBuffer();
				in_gl.bindBuffer(in_gl.ARRAY_BUFFER, refSysPositionBuffer);
				in_gl.bufferData(in_gl.ARRAY_BUFFER, refSysPosition, in_gl.STATIC_DRAW);

				in_gl.vertexAttribPointer(currentObj.shaderProgram.vertexPositionAttribute, 3, in_gl.FLOAT, false, 0, 0);

				in_gl.enableVertexAttribArray(currentObj.shaderProgram.vertexPositionAttribute);

				in_gl.drawArrays(in_gl.LINE_STRIP, 0, 2);
				
			}
		
	};

	this.drawEquatorialGrid = function(){
		
	};
	

	this.localInit();
	this.computePixels();
	this.initShaders();
	this.initBuffer();
//	console.log(currentObj.textures.images);
	this.initTexture();
//	console.log(currentObj.textures.images);

	

}
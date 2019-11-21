/**
 * @author Fabrizio Giordano (Fab)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */

function HiPS(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
	
	AbstractSkyEntity.call(this, in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils);
	var currentObj = this;
//	console.log(currentObj);

	this.localInit = function(){
		
		currentObj.radius = in_radius;
		
		currentObj.updateOnFoV = true;
		
		currentObj.pixels = [];
		
		currentObj.opacity = 1.00 * 100.0/100.0;
		
		currentObj.norder = 3;
		currentObj.nside = Math.pow(2, currentObj.norder);
		currentObj.healpix = new Healpix(currentObj.nside);
		currentObj.maxNPix = currentObj.healpix.getNPix();
		
		currentObj.URL = "http://skies.esac.esa.int/DSSColor/";
		currentObj.maxOrder = 9;
		
		currentObj.sphericalGrid = true;
		currentObj.xyzRefCoord = true;
		currentObj.equatorialGrid = false;
		
		// below this value we switch from AllSky to HEALPix geometry/texture
		currentObj.allskyFovLimit = 0.0;
		
		currentObj.sphericalGrid = new SphericalGrid(1.004, in_gl);
		
		currentObj.xyzRefSystem = new XYZSystem(in_gl);
		
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
		
		var nPixels = currentObj.pixels.length;
		var vertexPosition = new Float32Array(12*nPixels);

		var facesVec3Array;
		var p = [];
		
		var theta0, theta1, theta2, theta3;
		var phi0, phi1, phi2, phi3;
		
		var epsilon = 0.0;
		for (var i=0; i < nPixels; i++){
//		for (var i=nPixels - 1; i >= 0; i--){	
			
			
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
				vertexPosition[12*i+1] = -facesVec3Array[0].y ;
				vertexPosition[12*i+2] = facesVec3Array[0].z;
				
				vertexPosition[12*i+3] = facesVec3Array[1].x;
				vertexPosition[12*i+4] = -facesVec3Array[1].y;
				vertexPosition[12*i+5] = facesVec3Array[1].z;
				
				vertexPosition[12*i+6] = facesVec3Array[2].x;
				vertexPosition[12*i+7] = -facesVec3Array[2].y;
				vertexPosition[12*i+8] = facesVec3Array[2].z;
				
				vertexPosition[12*i+9] = facesVec3Array[3].x;
				vertexPosition[12*i+10] = -facesVec3Array[3].y;
				vertexPosition[12*i+11] = facesVec3Array[3].z;
				
			}
		}
		
		
		var textureCoordinates = new Float32Array(8*nPixels);
	    if (currentObj.fovObj.getMinFoV() >= currentObj.allskyFovLimit){
	    	//0.037037037
	    	var s_step=1/27;
	    	//0.034482759
	    	var t_step=1/29;
	    	
	    	var sindex = 0;
	    	var tindex = 0;
	    	for (var i=0; i < nPixels; i++){
//    		for (var i=nPixels - 1; i >= 0; i--){
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
	        	
//	        	textureCoordinates[8*i] = 0.0;
//	        	textureCoordinates[8*i+1] = 0.0;
//	        	textureCoordinates[8*i+2] = 0.0;
//	        	textureCoordinates[8*i+3] = 1.0;
//	        	textureCoordinates[8*i+4] = 1.0;
//	        	textureCoordinates[8*i+5] = 1.0;
//	        	textureCoordinates[8*i+6] = 1.0;
//	        	textureCoordinates[8*i+7] = 0.0;

	        }
	    }		
		
	    var vertexIndices = new Uint16Array(6*nPixels);
	    var baseFaceIndex = 0; 
	    for (var j=0; j< nPixels; j++){
//	    for (var j=nPixels-1; j>= 0; j--){
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
	    
		// if FoV >50 (norder <= 2) do the following
		
		if (currentObj.fovObj.getMinFoV() >= currentObj.allskyFovLimit){
			currentObj.textures[0] = in_gl.createTexture();
			
			currentObj.textures[0].image = new Image();
			currentObj.textures[0].image.setAttribute('crossorigin', 'anonymous');
		    
			currentObj.textures[0].image.onload = function () {
		        
		    	handleLoadedTexture(currentObj.textures[0], 0);
		    
		    };
		    
		    currentObj.textures[0].image.src = currentObj.URL+"/Norder3/Allsky.jpg";
		}else{
		    // TODO if FoV >=50 (norder >= 3) do the following
		    // compute visible pixels
		    // loop over visible pixels
		    // load images for the visible pixels by calling handleLoadedTexture
//			if (!fovInRange()){
//				for (var d=0;d<sky.textures.images.length;d++){
//					gl.deleteTexture(sky.textures.images[d]);
//				}
//				sky.textures.images.splice(0, sky.textures.images.length);
//				sky.textures.cache.splice(0, sky.textures.cache.length);
//			}
//			for (var n=0; n<pwgl.pixels.length;n++){
//				var texCacheIdx = pwgl.pixelsCache.indexOf(pwgl.pixels[n]);
//				if (texCacheIdx !== -1 ){
////					console.log("FROM CACHE");
//					sky.textures.images[n] = gl.createTexture();
//					sky.textures.images[n] = sky.textures.cache[texCacheIdx];
//				}else{
////					console.log("NEW TEXTURE");
//					sky.textures.images[n] = gl.createTexture();
//					var dirNumber = Math.floor(pwgl.pixels[n] / 10000) * 10000;
//					loadImageForTexture(sky.baseURL+"/Norder"+norder+"/Dir"+dirNumber+"/Npix"+pwgl.pixels[n]+".jpg", sky.textures.images[n], k);
//				}
//			}
//			sky.textures.cache = sky.textures.images.slice();
			
		}
	    
	    
	    
	    
	    function handleLoadedTexture (texture, shaderSkyIndex){
			
	        texture.image.setAttribute('crossorigin', 'anonymous');
			
	        in_gl.activeTexture(in_gl.TEXTURE0+shaderSkyIndex);
	        
			in_gl.pixelStorei(in_gl.UNPACK_FLIP_Y_WEBGL, true);
			in_gl.bindTexture(in_gl.TEXTURE_2D, texture);			
			in_gl.texImage2D(in_gl.TEXTURE_2D, 0, in_gl.RGBA, in_gl.RGBA, in_gl.UNSIGNED_BYTE, texture.image);
			
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

			if (!in_gl.isTexture(texture)){
		    	console.log("error in texture");
		    }
			in_gl.bindTexture(in_gl.TEXTURE_2D, null);
	        
		}
	};
	
	this.computeVisiblePixels = function(){
		
		
		// Model point having only Z as radius
		var modelZPoint = [in_position[0], in_position[1], in_position[2] + currentObj.radius , 1.0];
		mat4.multiplyVec4(currentObj.R, modelZPoint, modelZPoint);
		
		var p = new Pointing(new Vec3(modelZPoint[0], modelZPoint[1], modelZPoint[2]));
		var pixNo = healpix.ang2pix(p);
		
		var ccPixNo = getPixNo(cc);
		
		// TODO: PWGL?!? this comes from the other prototype
		
		if (pwgl.pixels.indexOf(ccPixNo) == -1){
			pwgl.pixels.push(ccPixNo);	
		}
		for (var i=-1; i<=1.1;i=i+0.25){
			for (var j=-1; j<=1;j=j+0.25){
				var xy = [i * 1/zoom,j * 1/zoom];
				var xyz = worldToModel(xy);
			    var rxyz = [];
			    rxyz[0] = pwgl.skyRotationMatrix[0] * xyz[0] + pwgl.skyRotationMatrix[1] * xyz[1] + pwgl.skyRotationMatrix[2] * xyz[2];
			    rxyz[1] = pwgl.skyRotationMatrix[4] * xyz[0] + pwgl.skyRotationMatrix[5] * xyz[1] + pwgl.skyRotationMatrix[6] * xyz[2];
			    rxyz[2] = pwgl.skyRotationMatrix[8] * xyz[0] + pwgl.skyRotationMatrix[9] * xyz[1] + pwgl.skyRotationMatrix[10] * xyz[2];
				
				
				var currPix = getPixNo(rxyz);
				
				if (pwgl.pixels.indexOf(currPix) == -1){
					pwgl.pixels.push(currPix);
				}
			}
		}
		
	};
	
	// TODO pass the norder. If the norder is greather than 3, then use 768 pixels (norder=3),
	// otherwise compute the pixels number 
	this.computePixels = function(){
		
		currentObj.pixels.splice(0, currentObj.pixels.length);
		for (var i=0; i < currentObj.maxNPix;i++){
			currentObj.pixels.push(i);
		}
		
	};
	
	this.fovInRange = function (){

		var fov = currentObj.fovObj.minFoV;
		var oldFov = currentObj.fovObj.prevMinFoV;
		if ( fov < 2 && (oldFov >= 2 || oldFov <1)){
			return true;
		}
		
		if ( fov < 4 && (oldFov >= 4 || oldFov <2)){
			return true;
		}
		
		if ( fov < 8 && (oldFov >= 8 || oldFov <4)){
			return true;
		}
		
		if ( fov < 16 && (oldFov >= 16 || oldFov <8)){
			return true;
		}
		
		if (fov < 50 && (oldFov >= 50 || oldFov<16)){
			return true;
		}
		return false;
	};
	
	
	this.setGeometryNeedsToBeRefreshed = function (){
		
		// computing total number of pixels at the equator 'Neq = 4 * Nside' for the current nside
		var neq = 4 * currentObj.nside;
		// TODO dynamic algorithm written in your notepad based on the number of pixels loaded
		
		var fov = currentObj.fovObj.minFoV;
		var oldFov = currentObj.fovObj.prevMinFoV;
		
		currentObj.refreshGeometryOnFoVChanged = currentObj.fovInRange();
		
		console.log("YUPPIEEEE! "+currentObj.refreshGeometryOnFoVChanged );
	};
	
	this.refreshMe = function(){
		
		if ( fov < 2 && (oldFov >= 2 || oldFov <1)){
			currentObj.norder = 7;
		}
		
		if ( fov < 4 && (oldFov >= 4 || oldFov <2)){
			currentObj.norder = 6;
		}
		
		if ( fov < 8 && (oldFov >= 8 || oldFov <4)){
			currentObj.norder = 5;
		}
		
		if ( fov < 16 && (oldFov >= 16 || oldFov <8)){
			currentObj.norder = 4;
		}
		
		if (fov < 50 && (oldFov >= 50 || oldFov<16)){
			currentObj.norder = 3;
		}
		
		currentObj.nside = Math.pow(2, currentObj.norder);
		currentObj.healpix = new Healpix(currentObj.nside);
		currentObj.maxNPix = currentObj.healpix.getNPix();
		
		currentObj.computePixels();
		currentObj.initBuffer();
		currentObj.initTexture();
	};
	
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
		
		
		// TODO
		// 1. check weather, basing on FoV, the HEALPix needs to be refreshed. If yes continue above, otherwise jump to point 4
		// 2. refresh buffers
		// 3. refresh textures
		// 4. draw
		
		in_gl.uniform1f(currentObj.shaderProgram.sphericalGridEnabledUniform, 0.0);
		
		// 1. check weather, basing on FoV, the HEALPix needs to be refreshed. If yes continue above, otherwise jump to point 4
		if (currentObj.refreshGeometryOnFoVChanged == true){
			// 2. refresh buffers
			// 3. refresh textures
			console.log("arigatooo");
			currentObj.refreshMe();
			currentObj.refreshGeometryOnFoVChanged = false;
		}

		// 4. draw
		
		
		
		if (currentObj.minFoV >= currentObj.allskyFovLimit){
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
	
		    if (currentObj.sphericalGrid) {
		    	currentObj.sphericalGrid.draw(currentObj.shaderProgram);
//		    	currentObj.drawSphericalGrid();
		    }
		    if (currentObj.equatorialGrid) {
		    	currentObj.drawEquatorialGrid();
		    }
		    
		    if (currentObj.xyzRefCoord){
				currentObj.xyzRefSystem.draw(currentObj.shaderProgram);	
			}
		}else{
			alert("dsdsa");
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
	this.initTexture();
	

}
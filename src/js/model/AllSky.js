"use strict";

import Healpix from 'healpix';

class AllSky {
	
	// constructor(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
    constructor(in_gl, shaderProgram, norder, URL, radius){
		this.gl = in_gl;
        this.shaderProgram = shaderProgram;
        this.norder = norder;
        this.URL = URL;
		this.radius = radius;
		this.healpix = new Healpix(Math.pow(2, this.norder));
        this.maxNPix = this.healpix.getNPix();
        this.textures = [];
		this.textures.images = [];
		this.textures.cache = [];
        this.pixels = [];
        this.pixelsCache = [];
		this.opacity = 1.00 * 100.0/100.0;
	}
	
	updateVisiblePixels (hips){
		this.pixels.splice(0, this.pixels.length);
		for (var i=0; i < this.maxNPix;i++){
			this.pixels.push(i);
		}
	}

	initBuffer () {
		var nPixels = this.pixels.length;
		var vertexPosition = new Float32Array(12*nPixels);

		var facesVec3Array;
		
		var theta0, theta1, theta2, theta3;
		var phi0, phi1, phi2, phi3;
		
		for (var i=0; i < nPixels; i++){			
			facesVec3Array = new Array();
			facesVec3Array = this.healpix.getBoundaries(this.pixels[i]);
			
			if (this.radius != 1){
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
				
				vertexPosition[12*i] = -this.radius * Math.sin(theta0) * Math.cos(phi0);
				vertexPosition[12*i+1] = this.radius * Math.sin(theta0) * Math.sin(phi0);
				vertexPosition[12*i+2] = this.radius * Math.cos(theta0);
				
				vertexPosition[12*i+3] = -this.radius * Math.sin(theta1) * Math.cos(phi1);
				vertexPosition[12*i+4] = this.radius * Math.sin(theta1) * Math.sin(phi1);
				vertexPosition[12*i+5] = this.radius * Math.cos(theta1);
				
				vertexPosition[12*i+6] = -this.radius * Math.sin(theta2) * Math.cos(phi2);
				vertexPosition[12*i+7] = this.radius * Math.sin(theta2) * Math.sin(phi2);
				vertexPosition[12*i+8] = this.radius * Math.cos(theta2);
				
				vertexPosition[12*i+9] = -this.radius * Math.sin(theta3) * Math.cos(phi3);
				vertexPosition[12*i+10] = this.radius * Math.sin(theta3) * Math.sin(phi3);
				vertexPosition[12*i+11] = this.radius * Math.cos(theta3);
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
	    
	    this.vertexPositionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexPosition, this.gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = vertexPosition.length;
		
		this.vertexTextureCoordBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer); 
		this.gl.bufferData(this.gl.ARRAY_BUFFER, textureCoordinates, this.gl.STATIC_DRAW);
		this.vertexTextureCoordBuffer.itemSize = 2;
		this.vertexTextureCoordBuffer.numItems = textureCoordinates.length;
	    
		this.vertexIndexBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, vertexIndices, this.gl.STATIC_DRAW);
	    this.vertexIndexBuffer.itemSize = 1;
		this.vertexIndexBuffer.numItems = vertexIndices.length;
	};

	initTexture (texturesNeedRefresh) {
		this.textures.cache.splice(0, this.textures.cache.length);
		
		this.textures.images[0] = {
				tex: this.gl.createTexture(),
				image: new Image()
		};
		
		this.textures.images[0].image = new Image();
		this.textures.images[0].image.setAttribute('crossorigin', 'anonymous');
		this.textures.images[0].image.src = this.URL+"/Norder3/Allsky.jpg";
		
		this.addOnLoad(this.textures.images[0], 0);
	}

	addOnLoad(image, n){
		image.image.onload = ()=> {
			this.isFullyLoaded = true;
			if(!image.isDeleted){
				this.handleLoadedTexture(image, 0, n);
			}
		};
	}

	handleLoadedTexture (textureObj, shaderSkyIndex, idx){
		this.gl.activeTexture(this.gl.TEXTURE0 + shaderSkyIndex);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.bindTexture(this.gl.TEXTURE_2D, textureObj.tex);

		try{
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureObj.image);
		}catch(error){
			console.error("ERROR");
			console.error(error);
			console.error("idx: "+idx+" pixels[idx] "+this.pixels[idx]);
			console.error(this.pixels);
		}
		console.log("handleLoadedTexture - Full sky - no mipmap");
		// it's not a power of 2. Turn off mip and set wrapping to clamp to edge
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

		// TODO REVIEW uniformSamplerLoc[shaderSkyIndex] !!!
		this.gl.uniform1i(this.shaderProgram.samplerUniform, shaderSkyIndex);

		if (!this.gl.isTexture(textureObj.tex)){
			console.log("error in texture");
		}
		
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}


	draw(uniformVertexTextureFactor){
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		
	    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.gl.activeTexture(this.gl.TEXTURE0);
//			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.images[0]);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.images[0].tex);
		this.gl.uniform1f(uniformVertexTextureFactor, this.opacity);
		
		for (var i=0;i<this.pixels.length;i++){
			this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 12*i);
		}
    }
}
export default AllSky;
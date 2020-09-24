"use strict";

import Healpix from 'healpix';
import RayPickingUtils from '../utils/RayPickingUtils';
import {Vec3, Pointing} from 'healpix';

const N_TILES_PER_TEXTURE = 16;
const N_PIXELS_PER_HIPS = 512;

class NOrder {

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
		this.isFullyLoaded = false;
		this.numberOfLoadedImages = 0;
		this.tex = null;
		this.shaderSkyIndex = this.norder - 3;
	}

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
	updateVisiblePixels (hips){
		this.pixelsCache = this.pixels.slice();
		this.pixels.splice(0, this.pixels.length);

//			// Model point having only Z as radius
//			var modelZPoint = [in_position[0], in_position[1], in_position[2] + currentObj.radius , 1.0];
//			
//			mat4.multiplyVec4(in_camerObj.getCameraMatrix(), modelZPoint, modelZPoint);
		
		var maxX = this.gl.canvas.width;
		var maxY = this.gl.canvas.height;

//			currentObj.pixels.splice(0, currentObj.pixels.length);
		var xy = [];
		var neighbours = [];
		var intersectionWithModel = {
				"intersectionPoint": null,
				"pickedObject": null
			};
		var intersectionPoint = null;
		var currP, currPixNo;
		
		// TODO probably it would be better to use query_disc_inclusive from HEALPix 
		// against a polygon. Check my FHIPSWebGL2 project (BufferManager.js -> updateVisiblePixels)
		var i = 0;
		for (i =0; i <= maxX; i+=maxX/10){
			var j = 0;
			for (j =0; j <= maxY; j+=maxY/10){
				intersectionWithModel = {
						"intersectionPoint": null,
						"pickedObject": null
					};
				
				xy = [i,j];
				
				intersectionWithModel = RayPickingUtils.getIntersectionPointWithSingleModel(xy[0], xy[1], hips);
				intersectionPoint = intersectionWithModel.intersectionPoint;

				if (intersectionPoint.length > 0){
					currP = new Pointing(new Vec3(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]));

					currPixNo = this.healpix.ang2pix(currP);
					if (currPixNo >= 0){
						neighbours = this.healpix.neighbours(currPixNo);
						if (this.pixels.indexOf(currPixNo) == -1){
							this.pixels.push(currPixNo);
						}
						var k = 0;
						for (k=0; k<neighbours.length; k++){
							if (this.pixels.indexOf(neighbours[k]) == -1){
								if(neighbours[k] >= 0){
									this.pixels.push(neighbours[k]);	
								}
							}
						}	
					}
				}
			}
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
		let size = 1.0 / N_TILES_PER_TEXTURE;
		for (var i=0; i < nPixels; i++){
			// UV mapping: 1, 0],[1, 1],[0, 1],[0, 0]
			let ix = i % N_TILES_PER_TEXTURE;
			let iy = Math.floor(i / N_TILES_PER_TEXTURE)
			textureCoordinates[8*i] = (ix + 1.0) * size;
			textureCoordinates[8*i+1] = iy*size;
			textureCoordinates[8*i+2] = (ix + 1.0) * size;
			textureCoordinates[8*i+3] = (iy + 1.0) * size;
			textureCoordinates[8*i+4] = ix*size;
			textureCoordinates[8*i+5] = (iy + 1.0) * size;
			textureCoordinates[8*i+6] = ix*size;
			textureCoordinates[8*i+7] = iy*size;
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
		this.numberOfLoadedImages = 0;
		this.isFullyLoaded = false;
		if (texturesNeedRefresh){
			console.log("[HiPS::initTexture] refreshing texture below AllSkyLimit");
			for (var d=0; d < this.textures.images.length; d++){
				this.textures.images[d].isDeleted = true;
				this.gl.deleteTexture(this.textures.images[d].tex);
			}
			
			this.textures.images.splice(0, this.textures.images.length);
			this.textures.cache.splice(0, this.textures.cache.length);
			texturesNeedRefresh = false;
		}
		this.tex = this.gl.createTexture();

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, N_TILES_PER_TEXTURE * N_PIXELS_PER_HIPS, N_TILES_PER_TEXTURE * N_PIXELS_PER_HIPS,
			 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(4 * N_TILES_PER_TEXTURE * N_TILES_PER_TEXTURE * N_PIXELS_PER_HIPS * N_PIXELS_PER_HIPS));

		for (var n=0; n < this.pixels.length;n++){
			var texCacheIdx = this.pixelsCache.indexOf(this.pixels[n]);
			if (texCacheIdx !== -1 && this.textures.cache.length > 0){
				if (this.textures.cache[texCacheIdx] == undefined){
					console.log("[HiPS::initTexture] missed in texcache but present in pixelcache"+texCacheIdx);
				}else{
					console.log("[HiPS::initTexture] in texcache idx "+texCacheIdx+" pixel "+this.pixels[n]);
					this.textures.images[n] = [];
					this.textures.images[n].tex = this.textures.cache[texCacheIdx].tex;
					this.textures.images[n].image = this.textures.cache[texCacheIdx].image;	
				}
				this.numberOfLoadedImages++;
			}else{
				this.textures.images[n] = {
						tex: this.gl.createTexture(),
						image: new Image()
				};

				// binding fake black image until the real image has been loaded (https://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905) 
				// this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.images[n].tex);
				// this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

				var dirNumber = Math.floor(this.pixels[n] / 10000) * 10000;
				
				this.textures.images[n].image = new Image();
				this.textures.images[n].image.n = n;
				
				this.addOnLoad(this.textures.images[n], n);
				
				this.textures.images[n].image.setAttribute('crossorigin', 'anonymous');
				this.textures.images[n].image.src = this.URL+"/Norder"+this.norder+"/Dir"+dirNumber+"/Npix"+this.pixels[n]+".jpg";
			}
		}
		console.log("this.textures.images.length="+this.textures.images.length);

		this.textures.cache = this.textures.images.slice();
	}

	addOnLoad(image, n){
		image.image.onload = ()=> {
			this.numberOfLoadedImages++;
			this.isFullyLoaded = this.numberOfLoadedImages == this.pixels.length;
			if(!image.isDeleted){
				this.handleLoadedTexture(image, this.shaderSkyIndex, n);
			}
		};
	}

	handleLoadedTexture (textureObj, shaderSkyIndex, idx){
		 this.gl.activeTexture(this.gl.TEXTURE0 + shaderSkyIndex);
		 this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		// this.gl.bindTexture(this.gl.TEXTURE_2D, textureObj.tex);

		try{
			let x = idx % N_TILES_PER_TEXTURE ;
			let y = Math.floor(idx / N_TILES_PER_TEXTURE);
			this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, x * N_PIXELS_PER_HIPS, y * N_PIXELS_PER_HIPS,  this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureObj.image);
		}catch(error){
			console.error("ERROR");
			console.error(error);
			console.error("idx: "+idx+" pixels[idx] "+this.pixels[idx]);
			console.error(this.pixels);
		}
		

		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		// TODO check which mipmap filtering is better. The one active or the commented alternative
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		
		// TODO REVIEW uniformSamplerLoc[shaderSkyIndex] !!!
		this.gl.uniform1i(this.shaderProgram.samplerUniform, shaderSkyIndex);

		// if (!this.gl.isTexture(textureObj.tex)){
		// 	console.log("error in texture");
		// }
		console.debug("Norder " + this.norder + " shaderSkyIndex "+ shaderSkyIndex + " src: " + textureObj.image.src + " idx: "+idx+" pixels[idx] "+this.pixels[idx]);
		
		// this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	draw(uniformVertexTextureFactorLoc){

		this.gl.activeTexture(this.gl.TEXTURE0 + this.shaderSkyIndex);

		if(this.old != this.vertexPositionBuffer){
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
			this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
			this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
				
			this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
			this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
		}
		this.gl.uniform1f(uniformVertexTextureFactorLoc, this.opacity);
					
		this.gl.drawElements(this.gl.TRIANGLES, 6 * this.pixels.length, 
				this.gl.UNSIGNED_SHORT, 0);

		this.old = this.vertexPositionBuffer;
	}
}
export default NOrder;
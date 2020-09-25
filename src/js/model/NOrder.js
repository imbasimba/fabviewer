"use strict";

import Healpix from 'healpix';
import RayPickingUtils from '../utils/RayPickingUtils';
import {Vec3, Pointing} from 'healpix';

class NOrder {

    constructor(in_gl, shaderProgram, norder, URL, radius){
        this.gl = in_gl;
        this.shaderProgram = shaderProgram;
        this.norder = norder;
		this.URL = URL;
		this.radius = radius;
		this.healpix = new Healpix(Math.pow(2, this.norder));
        this.maxNPix = this.healpix.getNPix();
		this.visibleTiles = {};
		this.previousVisibleTiles = {};
		this.opacity = 1.00 * 100.0/100.0;
		this.isFullyLoaded = false;
		this.numberOfLoadedImages = 0;
		this.numberOfVisibleTiles = 0;
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
		this.previousVisibleTiles = {...this.previousVisibleTiles, ...this.visibleTiles};
		this.visibleTiles = {};

//			// Model point having only Z as radius
//			var modelZPoint = [in_position[0], in_position[1], in_position[2] + currentObj.radius , 1.0];
//
//			mat4.multiplyVec4(in_camerObj.getCameraMatrix(), modelZPoint, modelZPoint);

		var maxX = this.gl.canvas.width;
		var maxY = this.gl.canvas.height;

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
						this.visibleTiles[currPixNo] = this.previousVisibleTiles[currPixNo] 
							? this.previousVisibleTiles[currPixNo] : {imageLoaded:false, ipix: currPixNo, textureLoaded: false};
						neighbours = this.healpix.neighbours(currPixNo);
						for (let k = 0; k < neighbours.length; k++){
							if(neighbours[k] >= 0){
								this.visibleTiles[neighbours[k]] = this.previousVisibleTiles[neighbours[k]] 
									? this.previousVisibleTiles[neighbours[k]] : {imageLoaded:false, ipix: neighbours[k], textureLoaded: false};
							}
						}
					}
				}
			}
		}

		this.keys = Object.keys(this.visibleTiles);
		this.numberOfVisibleTiles = this.keys.length;
	}

	initBuffer () {
		let vertexPosition = new Float32Array(12*this.numberOfVisibleTiles);

		let facesVec3Array;

		let theta0, theta1, theta2, theta3;
		let phi0, phi1, phi2, phi3;

		for (let i = 0; i < this.numberOfVisibleTiles; i++){
			facesVec3Array = new Array();
			facesVec3Array = this.healpix.getBoundaries(parseInt(this.keys[i]));
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
		
		var textureCoordinates = new Float32Array(8*this.numberOfVisibleTiles);
		
		for (var i=0; i < this.numberOfVisibleTiles; i++){
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

	    var vertexIndices = new Uint16Array(6*this.numberOfVisibleTiles);
	    var baseFaceIndex = 0;
	    for (var j=0; j< this.numberOfVisibleTiles; j++){
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

	initTexture () {
		this.numberOfLoadedImages = 0;
		this.isFullyLoaded = false;
		
		for (const [key, value] of Object.entries(this.visibleTiles)){
			if(value.image){ // Image is currently loading or has been loaded previously
				if(value.textureLoaded){
					this.numberOfLoadedImages++;
					this.isFullyLoaded = this.numberOfLoadedImages == this.numberOfVisibleTiles;
				} else if(value.imageLoaded){
					this.handleLoadedTexture(value, 0);
				}
				continue;
			}
			value.tex = this.gl.createTexture();
			value.image = new Image();

			// binding fake black image until the real image has been loaded (https://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905)
			this.gl.bindTexture(this.gl.TEXTURE_2D, value.tex);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

			var dirNumber = Math.floor(value.ipix / 10000) * 10000;

			this.addOnLoad(value);

			//TODO remove cross origin attribute for maps on the same domain as it slightly degrades loading time
			value.image.setAttribute('crossorigin', 'anonymous');
			value.image.src = this.URL+"/Norder"+this.norder+"/Dir"+dirNumber+"/Npix"+value.ipix+".jpg";
		}
	}

	addOnLoad(tile){
		tile.image.onload = ()=> {
			tile.imageLoaded = true;
			if(this.visibleTiles[tile.ipix] != undefined){
				this.handleLoadedTexture(tile, 0);
			}
		};
	}
	
	handleLoadedTexture (tile, shaderSkyIndex){
		tile.textureLoaded = true;
		this.numberOfLoadedImages++;
		this.isFullyLoaded = this.numberOfLoadedImages == this.numberOfVisibleTiles;
		this.gl.activeTexture(this.gl.TEXTURE0 + shaderSkyIndex);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.bindTexture(this.gl.TEXTURE_2D, tile.tex);

		try{
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, tile.image);
		}catch(error){
			console.error("ERROR");
			console.error(error);
			console.error("ipix: " + tile.ipix);
		}


		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		// TODO check which mipmap filtering is better. The one active or the commented alternative
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

		// TODO REVIEW uniformSamplerLoc[shaderSkyIndex] !!!
		this.gl.uniform1i(this.shaderProgram.samplerUniform, shaderSkyIndex);

		// if (!this.gl.isTexture(tile.tex)){
		// 	console.log("error in texture");
		// }
		// console.debug("Norder " + this.norder + " shaderSkyIndex "+ shaderSkyIndex + " src: " + tile.image.src + " ipix: " + tile.ipix);

		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	draw(uniformVertexTextureFactorLoc){
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

	    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		for (var i = 0; i < this.numberOfVisibleTiles; i++){
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.visibleTiles[this.keys[i]].tex);
			this.gl.uniform1f(uniformVertexTextureFactorLoc, this.opacity);

			this.gl.drawElements(this.gl.TRIANGLES, 6,
					this.gl.UNSIGNED_SHORT, 12*i);
		}
    }
}
export default NOrder;
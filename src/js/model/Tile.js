"use strict";

import global from '../Global';
import {tileBufferSingleton} from './TileBuffer';
import {healpixGridTileBufferSingleton} from './HealpixGridTileBuffer';
import {healpixGridTileDrawerSingleton} from './HealpixGridTileDrawer';
import {tileDrawerSingleton} from './TileDrawer';

class Tile {

	constructor(order, ipix, radius) {
		this.gl = global.gl;
        this.shaderProgram = this.gl.program;
		this.order = order;
		this.ipix = ipix;
		this.radius = radius != undefined ? radius : 1;

		if(this.order > 0 && this.parent == undefined){
			this.parent = tileBufferSingleton.getTile(this.order - 1, Math.floor(this.ipix/4));
			this.parent.setChild(this);
		}
		this.imageLoaded = false;
		this.textureLoaded = false;
		this._isInView = false;
		this.numberOfVisibleChildrenReadyToDraw = 0;
		this.childrenReady = false;

		this.opacity = 1.00 * 100.0/100.0;

		this.initBuffer();
		this.initTexture();
		this.children = [];
	}

	initBuffer () {
		let vertexPosition = new Float32Array(12);
		let facesVec3Array = global.getHealpix(this.order).getBoundaries(this.ipix);
		if (this.radius != 1){
			// HiPS radius different from Healpix default radius 1.
			// Mapping HEALPix coordinates to the new sphere and radius
			let theta0, theta1, theta2, theta3;
			let phi0, phi1, phi2, phi3;
			theta0 = Math.acos(facesVec3Array[0].z);
			theta1 = Math.acos(facesVec3Array[1].z);
			theta2 = Math.acos(facesVec3Array[2].z);
			theta3 = Math.acos(facesVec3Array[3].z);

			phi0 = Math.atan2(facesVec3Array[0].y, facesVec3Array[0].x);
			phi1 = Math.atan2(facesVec3Array[1].y, facesVec3Array[1].x);
			phi2 = Math.atan2(facesVec3Array[2].y, facesVec3Array[2].x);
			phi3 = Math.atan2(facesVec3Array[3].y, facesVec3Array[3].x);

			vertexPosition[0] = -this.radius * Math.sin(theta0) * Math.cos(phi0);
			vertexPosition[1] = this.radius * Math.sin(theta0) * Math.sin(phi0);
			vertexPosition[2] = this.radius * Math.cos(theta0);

			vertexPosition[3] = -this.radius * Math.sin(theta1) * Math.cos(phi1);
			vertexPosition[4] = this.radius * Math.sin(theta1) * Math.sin(phi1);
			vertexPosition[5] = this.radius * Math.cos(theta1);

			vertexPosition[6] = -this.radius * Math.sin(theta2) * Math.cos(phi2);
			vertexPosition[7] = this.radius * Math.sin(theta2) * Math.sin(phi2);
			vertexPosition[8] = this.radius * Math.cos(theta2);

			vertexPosition[9] = -this.radius * Math.sin(theta3) * Math.cos(phi3);
			vertexPosition[10] = this.radius * Math.sin(theta3) * Math.sin(phi3);
			vertexPosition[11] = this.radius * Math.cos(theta3);
		} else{
			vertexPosition[0] = facesVec3Array[0].x ;
			vertexPosition[1] = facesVec3Array[0].y ;
			vertexPosition[2] = facesVec3Array[0].z;

			vertexPosition[3] = facesVec3Array[1].x;
			vertexPosition[4] = facesVec3Array[1].y;
			vertexPosition[5] = facesVec3Array[1].z;

			vertexPosition[6] = facesVec3Array[2].x;
			vertexPosition[7] = facesVec3Array[2].y;
			vertexPosition[8] = facesVec3Array[2].z;

			vertexPosition[9] = facesVec3Array[3].x;
			vertexPosition[10] = facesVec3Array[3].y;
			vertexPosition[11] = facesVec3Array[3].z;
		}

		var textureCoordinates = new Float32Array(8);

		// UV mapping: 1, 0],[1, 1],[0, 1],[0, 0]
		textureCoordinates[0] = 1.0;
		textureCoordinates[1] = 0.0;
		textureCoordinates[2] = 1.0;
		textureCoordinates[3] = 1.0;
		textureCoordinates[4] = 0.0;
		textureCoordinates[5] = 1.0;
		textureCoordinates[6] = 0.0;
		textureCoordinates[7] = 0.0;

	    var vertexIndices = new Uint16Array(6);
	    var baseFaceIndex = 0;
		vertexIndices[0] = baseFaceIndex;
		vertexIndices[1] = baseFaceIndex + 1;
		vertexIndices[2] = baseFaceIndex + 2;

		vertexIndices[3] = baseFaceIndex;
		vertexIndices[4] = baseFaceIndex + 2;
		vertexIndices[5] = baseFaceIndex + 3;

		baseFaceIndex = baseFaceIndex + 4;

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

		if(this.image){ // Image is currently loading or has been loaded previously
			if(this.textureLoaded){
				this.numberOfLoadedImages++;
				this.isFullyLoaded = true;
			} else if(this.imageLoaded){
				this.handleLoadedTexture(this, 0);
			}
			return;
		}
		this.tex = this.gl.createTexture();
		this.image = new Image();

		// binding fake black image until the real image has been loaded (https://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905)
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

		var dirNumber = Math.floor(this.ipix / 10000) * 10000;

		this.addOnLoad();
		
		let fileFormat = this.fitsEnabled ? ".fits" : ".jpg"
		//TODO remove cross origin attribute for maps on the same domain as it slightly degrades loading time
		this.image.setAttribute('crossorigin', 'anonymous');
		this.imageUrl = "https://skies.esac.esa.int/DSSColor/Norder"+this.order+"/Dir"+dirNumber+"/Npix"+this.ipix+fileFormat;
	}

	addOnLoad(){
		this.image.onload = ()=> {
			this.imageLoaded = true;
			this.handleLoadedTexture(0);
		};
	}

	handleLoadedTexture (shaderSkyIndex){
		this.textureLoaded = true;
		this.numberOfLoadedImages++;
		this.isFullyLoaded = true;
		this.gl.activeTexture(this.gl.TEXTURE0 + shaderSkyIndex);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);

		try{
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
		}catch(error){
			console.error("ERROR");
			console.error(error);
			console.error("ipix: " + this.ipix);
		}


		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		// TODO check which mipmap filtering is better. The one active or the commented alternative
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
//	DO NOT DELETEthis.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

		// TODO REVIEW uniformSamplerLoc[shaderSkyIndex] !!!
		// this.gl.uniform1i(this.shaderProgram.samplerUniform, shaderSkyIndex);

		// if (!this.gl.isTexture(tile.tex)){
		// 	console.log("error in texture");
		// }

		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		if(this.parent){
			this.parent.childReady();
		}
	}

	startLoadingImage(){
		if(this.fitsEnabled){
			new FabFitsReader(this.imageUrl, "grayscale", "linear", 0.0966, 2.461, function (img){
				this.image = img;
				this.imageLoaded = true;
				this.handleLoadedTexture(0);
			});
		} else {
			this.image.src = this.imageUrl;
		}
	}
	stopLoadingImage(){
		this.image.src = "";
	}

	isInView(){
		return this._isInView;
	}

	setChild(child){
		if(!this.children.includes(child)){
			this.children.push(child);
			this.childAddedToView();
		}
	}

	addToView(){
		if(this._isInView) {return}
		this._isInView = true;
		if(this.parent){
			this.parent.childAddedToView();
		}
		tileDrawerSingleton.add(this);
		healpixGridTileDrawerSingleton.add(healpixGridTileBufferSingleton.getTile(this.order, this.ipix));
	}

	childReady(){
		this.numberOfVisibleChildrenReadyToDraw++;
		if(this.numberOfVisibleChildrenReadyToDraw == 4 && global.order > this.order){
			this.childrenReady = true;
			this.removeFromDrawAsChildrenAreReady();
		}
	}

	removeFromDrawAsChildrenAreReady(){
		tileDrawerSingleton.remove(this);
		healpixGridTileDrawerSingleton.remove(healpixGridTileBufferSingleton.getTile(this.order, this.ipix));
		if(this.parent){
			this.parent.childRemovedChildrenDrawnInstead();
		}
	}

	childRemovedChildrenDrawnInstead(){
		let drawnChildren = 0;
		this.children.forEach(child => {
			if((child._isInView && child.textureLoaded && global.order > this.order) 
				|| (child.childrenReady && global.order > child.order) 
				){
					drawnChildren++;
			}
			if(drawnChildren == 4){
				this.removeFromDrawAsChildrenAreReady();
			}
		});
	}

	childAddedToView(){
		let numberOfVisibleChildren = 0;
		let numberOfChildrenInViewWithLoadedTextures = 0;
		this.children.forEach(child => {
			if(child.isInView()){ 
				numberOfVisibleChildren++;
			}
			if(child.isInView() && child.textureLoaded){ 
				numberOfChildrenInViewWithLoadedTextures++;
			}
		});

		if(numberOfChildrenInViewWithLoadedTextures == numberOfVisibleChildren
			&& global.order > this.order){
				this.removeFromDrawAsChildrenAreReady();
		} else {
			this.addToView();
		}
	}

	removeFromView(){
		if(!this._isInView) {return}
		this._isInView = false;

		tileDrawerSingleton.remove(this);
		healpixGridTileDrawerSingleton.remove(healpixGridTileBufferSingleton.getTile(this.order, this.ipix));
		if(this.parent){
			this.parent.childRemovedFromView();
		}
	}

	childRemovedFromView(){
		let numberOfVisibleChildren = 0;
		let numberOfChildrenInViewWithLoadedTextures = 0;
		this.children.forEach(child => {
			if(child.isInView()){ 
				numberOfVisibleChildren++;
			}
			if(child.isInView() && child.textureLoaded){ 
				numberOfChildrenInViewWithLoadedTextures++;
			}
		});

		if((numberOfVisibleChildren == 0)){
			this.removeFromView();
		} else if(numberOfChildrenInViewWithLoadedTextures == numberOfVisibleChildren
				&& global.order > this.order) {
		} else{
			this.addToView();
		}
	}
}
export default Tile;
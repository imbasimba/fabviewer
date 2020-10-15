"use strict";

import global from '../Global';

class TileDrawer {

	constructor() {
		this.tiles = {};
	}

	initShaders () {
		this.shaderProgram = this.gl.createProgram();
		let fragmentShader = this.getShader("hips-shader-fs");
		let vertexShader = this.getShader("hips-shader-vs");

		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
		this.gl.shaderProgram = this.shaderProgram;

		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.setUniformLocation();
	}


	getShader(id){
		let shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		let str = "";
		let k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		let shader;
		if (shaderScript.type == "x-shader/x-fragment") {
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		} else {
			return null;
		}

		this.gl.shaderSource(shader, str);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert(this.gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	setUniformLocation (){
		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMMatrix");
		this.shaderProgram.vMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uVMatrix");
		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler0");
		this.shaderProgram.uniformVertexTextureFactor = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
		this.gl.uniform1f(this.shaderProgram.uniformVertexTextureFactor, 1.0);
	}

	enableShader(pMatrix, vMatrix, modelMatrix){
		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMMatrix");
		this.shaderProgram.vMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uVMatrix");
		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler0");
		this.shaderProgram.uniformVertexTextureFactor = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
		this.shaderProgram.sphericalGridEnabledUniform = this.gl.getUniformLocation(this.shaderProgram, "uSphericalGrid");

		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");

		this.gl.uniform1f(this.shaderProgram.uniformVertexTextureFactor, 1.0);
		this.gl.uniformMatrix4fv(this.shaderProgram.mMatrixUniform, false, modelMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.vMatrixUniform, false, vMatrix);

		this.uniformVertexTextureFactorLoc = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
	}

	init(){
		this.gl = global.gl;
		this.initShaders();
	}

	add(tile){
		let tileKey = tile.order + "/" + tile.ipix;
		if(!this.tiles[tileKey]){
			this.tiles[tileKey] = tile; 
			if(!tile.imageLoaded){
				tile.startLoadingImage();
			}
		}
	}

	remove(tile){
		let tileKey = tile.order + "/" + tile.ipix;

		if(this.tiles[tileKey]){
			if(!tile.imageLoaded){
				tile.stopLoadingImage();
			}
			delete this.tiles[tileKey];
		}
	}

	clear(){
		this.tiles = {};
	}

	draw(pMatrix, vMatrix, modelMatrix){
		this.enableShader(pMatrix, vMatrix, modelMatrix);
		Object.keys(this.tiles).forEach(ipix => {
			this.drawTile(this.tiles[ipix]);
		});
	}

	drawTile(tile){
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tile.vertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, tile.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tile.vertexTextureCoordBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, tile.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, tile.vertexIndexBuffer);

		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, tile.tex);
		// this.gl.uniform1f(uniformVertexTextureFactorLoc, this.opacity);

		this.gl.drawElements(this.gl.TRIANGLES, 6,
			this.gl.UNSIGNED_SHORT, 0);
	}
}
export const tileDrawerSingleton = new TileDrawer();
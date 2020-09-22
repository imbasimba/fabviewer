"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 * @param in_radius - number
 * @param in_gl - GL context
 * @param in_position - array of double e.g. [0.0, 0.0, -7]
 */

import AbstractSkyEntity from './AbstractSkyEntity';
import SphericalGrid from './SphericalGrid';
import XYZSystem from './XYZSystem';
import global from '../Global';
import NOrder from './NOrder';
import AllSky from './AllSky';

class HiPS extends AbstractSkyEntity{
	
	constructor(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils){
		
		super(in_radius, in_gl, in_canvas, in_position, in_xRad, in_yRad, in_name, in_fovUtils);
		
		this.radius = in_radius;
		this.gl = in_gl;
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA  );
		
		this.updateOnFoV = true;
		
		this.norder = 3;
		this.norders = [];
		this.prevNorder = 0;
		// below this value we switch from AllSky to HEALPix geometry/texture
		this.allskyFovLimit = 32.0;
		this.URL = "https://skies.esac.esa.int/DSSColor/";
		this.norders[this.norder] = new AllSky(this.gl, this.shaderProgram, this.norder, this.URL, this.radius);
		this.maxOrder = 9;
		
		this.showSphericalGrid = false;
		this.showXyzRefCoord = false;
		this.showEquatorialGrid = false;
		
		this.sphericalGrid = new SphericalGrid(1.004, this.gl);
		
		this.xyzRefSystem = new XYZSystem(this.gl);
		
		this.initShaders();
	}
	
	initShaders () {
		var _self = this;
		var fragmentShader = getShader("hips-shader-fs");
		var vertexShader = getShader("hips-shader-vs");

		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

		this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
		this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

		this.setUniformLocation(); 
		
		
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
				shader = _self.gl.createShader(_self.gl.FRAGMENT_SHADER);
			} else if (shaderScript.type == "x-shader/x-vertex") {
				shader = _self.gl.createShader(_self.gl.VERTEX_SHADER);
			} else {
				return null;
			}

			_self.gl.shaderSource(shader, str);
			_self.gl.compileShader(shader);

			if (!_self.gl.getShaderParameter(shader, _self.gl.COMPILE_STATUS)) {
				alert(_self.gl.getShaderInfoLog(shader));
				return null;
			}

			return shader;
	    }
	    
	}
	
	setUniformLocation (){
		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMMatrix");
		this.shaderProgram.vMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uVMatrix");
		this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler0");
		this.shaderProgram.uniformVertexTextureFactor = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
		this.gl.uniform1f(this.shaderProgram.uniformVertexTextureFactor, 1.0);
	}
	
	refreshModel (in_fov, in_pan){
		if (in_pan && in_fov < this.allskyFovLimit){
			//TODO!!!!!!!!!!!!!!!!
			// this.texturesNeedRefresh = false;
			// this.updateVisiblePixels(now);

			// this.initBuffer();
			// // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// // THIS ONE SHOULD GO INTO DRAW (probabky hehe)!!!!!!!
			// // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// this.initTexture(now);
		}else{
			if ( in_fov >= this.allskyFovLimit){
				this.norder = 3;
			}else if ( in_fov >= 32){
				this.norder = 3;
			}else if (in_fov >= 16){
				this.norder = 4;
			}else if (in_fov >= 8){
				this.norder = 5;
			}else if (in_fov >= 4){
				this.norder = 6;
			}else if (in_fov >= 2){
				this.norder = 7;
			}else if (in_fov >= 1){
				this.norder = 8;
			}else if (in_fov >= 0.5){
				this.norder = 9;
			}else if (in_fov >= 0.25){
				this.norder = 10;
			}else if (in_fov >= 0.125){
				this.norder = 11;
			}else{
				this.norder = 12;
			}
			this.norder = Math.min(this.norder, this.maxOrder);
			
			var needsRefresh = (this.norder != this.prevNorder) || 
					(in_fov < this.allskyFovLimit && this.prevFoV >= this.allskyFovLimit) || 
					(in_fov > this.allskyFovLimit && this.prevFoV <= this.allskyFovLimit);
			
			if ( needsRefresh ){
				console.log("[HiPS::refreshModel] needsRefresh "+needsRefresh);
				
				this.prevNorder = this.norder;
				
				// TODO refresh geometry
				console.log("norder = "+ this.norder);
				if(this.norders[this.norder] == undefined){
					this.norders[this.norder] = new NOrder(this.gl, this.shaderProgram, this.norder, this.URL, this.radius);
				}
				this.norders[this.norder].updateVisiblePixels(this);
				this.norders[this.norder].initBuffer();
				this.norders[this.norder].initTexture(true);
				// if(this.norder != 3){
				// 	this.norders[3].updateVisiblePixels(this);
				// 	this.norders[3].initBuffer();
				// 	this.norders[3].initTexture(true);
				// }
			}	
		}
		this.prevFoV = in_fov;
	}
	
	
	enableShader(pMatrix, vMatrix){
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
		this.gl.uniformMatrix4fv(this.shaderProgram.mMatrixUniform, false, this.modelMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.vMatrixUniform, false, vMatrix);
		
		this.uniformVertexTextureFactorLoc = this.gl.getUniformLocation(this.shaderProgram, "uFactor0");
		
		this.gl.uniform1f(this.shaderProgram.sphericalGridEnabledUniform, 0.0);
	}
	
	drawNorder(norder){
		if(this.norder <= 3 || this.norders[norder].isFullyLoaded){
			// if(this.norder <= 3 || this.norders[norder].isFullyLoaded){
			this.norders[norder].draw();
			if(norder == this.norder){
				console.log("Preferred layer " + norder + " fully loaded - Not drawing above layer");
			} else {
				console.log("Drawing above layer: " + norder);
			}
		} else {
			this.drawNorder(norder-1);
			this.norders[norder].draw();
			console.log("Drawing incomplete layer: " + norder);
		}
	}
	
	draw(pMatrix, vMatrix){
		this.enableShader(pMatrix, vMatrix);
		
		this.gl.enable(this.gl.BLEND);
		this.drawNorder(this.norder);
		this.gl.disable(this.gl.BLEND);

		if (this.showSphericalGrid) {
			this.sphericalGrid.draw(this.shaderProgram);
	    }
	    if (this.showEquatorialGrid) {
	    	this.drawEquatorialGrid();
	    }
	    
	    if (this.showXyzRefCoord){
	    	this.xyzRefSystem.draw(this.shaderProgram);	
		}
	}
	

	drawSphericalGrid (){
		
		var x, y, z;
		var r = 1.004;
		var thetaRad, phiRad;
		
		var thetaStep, phiStep;
		
		this.gl.uniform1f(this.shaderProgram.sphericalGridEnabledUniform, 1.0);
		
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

			var phiVertexPositionBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, phiVertexPositionBuffer);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, phiVertexPosition, this.gl.STATIC_DRAW);

			this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

			this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

			this.gl.drawArrays(this.gl.LINE_LOOP, 0, 360/phiStep);
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
			
			var thetaVertexPositionBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, thetaVertexPositionBuffer);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, thetaVertexPosition, this.gl.STATIC_DRAW);

			this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

			this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

			this.gl.drawArrays(this.gl.LINE_LOOP, 0, 360/thetaStep);

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
				
				this.gl.uniform1f(this.shaderProgram.sphericalGridEnabledUniform, k + 2.0);
				
				refSysPosition[3] = versors[k][0];
				refSysPosition[4] = versors[k][1];
				refSysPosition[5] = versors[k][2];
				
				var refSysPositionBuffer = this.gl.createBuffer();
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, refSysPositionBuffer);
				this.gl.bufferData(this.gl.ARRAY_BUFFER, refSysPosition, this.gl.STATIC_DRAW);

				this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

				this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

				this.gl.drawArrays(this.gl.LINE_STRIP, 0, 2);
				
			}
		
	}

	drawEquatorialGrid (){
		
	}
	
}

export default HiPS;

"use strict";

import global from '../Global';

class HealpixGridTile {

	constructor(order, ipix) {
		this.gl = global.gl;
        this.shaderProgram = this.gl.gridShaderProgram;
		this.order = order;
		this.ipix = ipix;
		
		this.initBuffer();
	}

	initBuffer () {
		let vertexPosition = new Float32Array(12);

		let facesVec3Array = new Array();
		facesVec3Array = global.getHealpix(this.order).getBoundaries(this.ipix);

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

		this.vertexPosition = vertexPosition;
	    this.vertexPositionBuffer = this.gl.createBuffer();
		this.vertexPositionBuffer.itemSize = 3;
		this.vertexPositionBuffer.numItems = vertexPosition.length;
		
		this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
	};
}
export default HealpixGridTile;
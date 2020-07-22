"use strict";
class Global{
	constructor(){
		this._pMatrix = null;	// projection matrix (perspective)
		this._mvMatrix = null;	// TODO model view matrix ? needed?
		this._model = null;	// selected object
		this._camera = null;	// the camera object
		this._gl = null;		// GL context
		this._rayPicker = null;	// TODO probably useless here ince all methods are static
	}
	
	get pMatrix(){
		return this._pMatrix;
	}
	// IS IT USED?!?
	get mvMatrix(){
		return this._mvMatrix;
	}
	
	get model(){
		return this._model;
	}
	
	get camera(){
		return this._camera;
	}
	
	get gl(){
		return this._gl;
	}
	
	get rayPicker(){
		return this._rayPicker;
	}
	
	set pMatrix(in_pMatrix){
		this._pMatrix = in_pMatrix;
	}
	// TODO
	set mvMatrix(in_mvMatrix){
		this._mvMatrix = in_mvMatrix;
	}
	
	set model(in_model){
		this._model = in_model;
	}
	
	set camera(in_camera){
		this._camera = in_camera;
	}
	
	set gl(in_gl){
		this._gl = in_gl;
	}
	// TODO
	set rayPicker(in_rayPicker){
		this._rayPicker = in_rayPicker;
	}
	
}

var global = new Global();
//var global = {
//	pMatrix: null,	// projection matrix (perspective)
//	mvMatrix: null,	// model view matrix ? needed?
//	model: null,	// selected object
//	camera: null,	// the camera object
//	gl: null		// GL context
//};
//
//function refreshGlobalpMatrix(in_pMatrix){
//	global.pMatrix = in_pMatrix;
//}
//
//function refreshGlobalmvMatrix(in_mvMatrix){
//	global.mvMatrix = in_mvMatrix;
//}
//
//function refreshGlobalModel(in_model){
//	global.model = in_model;
//}
//
//function refreshGlobalCamera(in_camera){
//	global.camera = in_camera;
//}
//
//function refreshGlobalpMatrix(in_gl){
//	global.gl = in_gl;
//}
//


class Global{
	constructor(){
		this._pMatrix = null;	// projection matrix (perspective)
		this._mvMatrix = null;	// model view matrix ? needed?
		this._model = null;	// selected object
		this._camera = null;	// the camera object
		this._gl = null;		// GL context
		this._rayPicker = null;
	}
	
	get pMatrix(){
		return this._pMatrix;
	}
	
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
	
	set rayPicker(in_rayPicker){
		this._rayPicker = in_rayPicker;
	}
	
}

var global = new Global();
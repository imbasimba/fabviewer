/**
 * @author Fabrizio Giordano (Fab)
 */
function ModelRepo(in_gl, in_canvas){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.objModels = [];
		
		currentObj.objModels[0] = new Moon(2, in_gl, in_canvas, [0.0, 0.0, -7.0], 0, 0, "Moon");
		
		currentObj.objModels[1] = new HiPS(2, in_gl, in_canvas, [-6.0, 0.0, -7.0], 0, 0, "HiPS");
		
	};

	this.init();
}
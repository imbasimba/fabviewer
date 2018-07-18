/**
 * @author Fabrizio Giordano (Fab)
 */
function FVApp(){
	if (DEBUG){
		console.log("[FVApp::FVApp]");
	}
	var currentObj = this;
	
	this.init = function(){
		if (DEBUG){
			console.log("[FVApp::init]");
		}
		var canvas = document.getElementById("fabviewer");
//		var canvas = currentObj.view.canvas;
		
		try {
			if (DEBUG){
				console.log("[FVApp::init]canvas");
				console.log(canvas);
			}
			
			currentObj.gl = canvas.getContext("experimental-webgl");
			currentObj.gl.viewportWidth = canvas.width;
			currentObj.gl.viewportHeight = canvas.height;
			currentObj.gl.clearColor(0.3, 0.65, 0.3, 1.0);
			currentObj.gl.enable(currentObj.gl.DEPTH_TEST);
			
		} catch (e) {
			console.log("Error instansiating WebGL context");
		}
		if (!currentObj.gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
		
		currentObj.view = new FVView(canvas);
		
		currentObj.presenter = new FVPresenter(currentObj.view, currentObj.gl);
		
	};
	
	this.run = function(){
		if (DEBUG){
			console.log("[FVApp::run]");
		}
		currentObj.tick();
	};
	
	this.tick = function () {
		
		requestAnimFrame(currentObj.tick);
		
		currentObj.drawScene();
		
	}

	
	
	this.drawScene = function(){
		
		currentObj.presenter.draw();
	};
	
	this.init();	
	
}
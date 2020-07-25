/**
 * @author Fabrizio Giordano (Fab77)
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
		
		try {
			if (DEBUG){
				console.log("[FVApp::init]canvas");
				console.log(canvas);
			}
			
			currentObj.gl = canvas.getContext("experimental-webgl");
			
			console.log("before");
			
			let params = new URLSearchParams(location.search);
			if (params.get('debug') != null){
				console.warn("WebGL DEBUG MODE ON");
				currentObj.gl = WebGLDebugUtils.makeDebugContext(currentObj.gl);	
			}
			
			currentObj.gl.viewportWidth = canvas.width;
			currentObj.gl.viewportHeight = canvas.height;
			currentObj.gl.clearColor(0.412, 0.412, 0.412, 1.0);
			
			currentObj.gl.enable(currentObj.gl.DEPTH_TEST);
			
		} catch (e) {
			console.log("Error instansiating WebGL context");
		}
		if (!currentObj.gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
		
		currentObj.view = new FVView(canvas);
		
		global.gl = currentObj.gl;
		currentObj.presenter = new FVPresenter(currentObj.view, currentObj.gl);
		
		currentObj.fabVReqID = '';
		
		
	};
	
	this.initListeners = function(){
		
		function resizeCanvas() {
			if (DEBUG){
				console.log("[FVPresenter::addEventListeners->resizeCanvas]");
			}
		   	currentObj.view.resize(currentObj.gl);
		   	currentObj.presenter.draw();
		}
		
		function handleContextLost(event){
			console.log("[handleContextLost]");
			event.preventDefault();
			cancelRequestAnimFrame(currentObj.fabVReqID);
		}

		function handleContextRestored(event){
			console.log("[handleContextRestored]");
			currentObj.gl.viewportWidth = canvas.width;
			currentObj.gl.viewportHeight = canvas.height;
			currentObj.gl.clearColorrgbrgb(0.86, 0.86, 0.86, 1.0);
			
			currentObj.gl.enable(currentObj.gl.DEPTH_TEST);
			
			currentObj.fabVReqID = requestAnimFrame(currentObj.tick, canvas);
		}
		
		
		window.addEventListener('resize', resizeCanvas);
		currentObj.view.canvas.addEventListener('webglcontextlost', handleContextLost, false);
		currentObj.view.canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
		resizeCanvas();
	};
	
	this.run = function(){
		if (DEBUG){
			console.log("[FVApp::run]");
		}
		currentObj.tick();
	};
	
	this.tick = function () {
		
		currentObj.drawScene();
		var error = currentObj.gl.getError();
		if (error != currentObj.gl.NO_ERROR && error != currentObj.gl.CONTEXT_LOST_WEBGL) {
//			alert("GL error: "+error);
			console.log("GL error: "+error);
		}

		currentObj.fabVReqID = requestAnimFrame(currentObj.tick);
		
	}

	
	
	this.drawScene = function(){
		
		currentObj.presenter.draw();
	};
	
	this.init();
	this.initListeners();
	
}
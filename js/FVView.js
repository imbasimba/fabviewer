/**
 * @author Fabrizio Giordano (Fab)
 */
function FVView(in_canvas){
	
	if (DEBUG){
		console.log("[FVView::FVView]");
	}
	var currentObj = this;
	
	this.init = function (){
		if (DEBUG){
			console.log("[FVView::init]");
		}
		currentObj.canvas = in_canvas;
		currentObj.container = document.getElementById('fabvcontainer');
		currentObj.container.style.height = window.innerHeight + 'px';
		currentObj.container.style.width = window.innerWidth + 'px';
		currentObj.controlpanel = document.getElementById('controlpanel');
		currentObj.datapanel = document.getElementById('datapanel');
		
		currentObj.pickedobjvalue_dom = document.getElementById('pickedobjectvalue');
		
		currentObj.fovvalue_dom = document.getElementById('fovvalue');
		currentObj.coords_phi_dom = document.getElementById('phi');
		currentObj.coords_theta_dom = document.getElementById('theta');
		
		currentObj.coords_radeg_dom = document.getElementById('RA_deg');
		currentObj.coords_decdeg_dom = document.getElementById('Dec_deg');
		
		currentObj.coords_rahms_dom = document.getElementById('RA_hms');
		currentObj.coords_decdms_dom = document.getElementById('Dec_dms');
		
		currentObj.fpsvalue_dom = document.getElementById('fpsvalue');
		currentObj.avgfpsvalue_dom = document.getElementById('avgfpsvalue');
		
		currentObj.fovX_deg = 180.0;
		currentObj.fovY_deg = 180.0;
//		currentObj.previousFoV = 180;
//		currentObj.updateFoV([currentObj.fovX_deg, currentObj.fovY_deg]);
				
		currentObj.widthToHeight = 4 / 3;
	};
	
	this.updateFps = function(in_fps, in_avg){
		
		currentObj.fpsvalue_dom.innerHTML = in_fps.toFixed(1);
		currentObj.avgfpsvalue_dom.innerHTML = in_avg.toFixed(1);
		
	};
	
	this.updateFoV = function(in_fovObj){
		if (DEBUG){
			console.log("[FVView::updateFoV]");
		}
		currentObj.fovvalue_dom.innerHTML = in_fovObj.fovX_deg.toFixed(4) + '&deg;x'+ in_fovObj.fovY_deg.toFixed(4) + '&deg;';
//		currentObj.previousFoV = (in_fovXY[0] <= in_fovXY[1]) ? in_fovXY[0] : in_fovXY[1];
		
	};
	
	this.setPickedSphericalCoordinates = function(phiThetaDeg){
		currentObj.coords_phi_dom.innerHTML = phiThetaDeg.phi.toFixed(4);
		currentObj.coords_theta_dom.innerHTML = phiThetaDeg.theta.toFixed(4);
	};
	
	this.setPickedAstroCoordinates = function(raDecDeg, raHMS, decDMS){
		currentObj.coords_radeg_dom.innerHTML = raDecDeg.ra.toFixed(4);
		currentObj.coords_decdeg_dom.innerHTML = raDecDeg.dec.toFixed(4);
		currentObj.coords_rahms_dom.innerHTML = raHMS.h +" "+raHMS.m +" "+raHMS.s.toFixed(2);
		var sign = '+';
		if (decDMS.d < 0){
			sign = '-';
		}
		currentObj.coords_decdms_dom.innerHTML = sign+decDMS.d+" "+decDMS.m+" "+decDMS.s.toFixed(2);
	};
	
	this.setPickedObjectName = function(name){
		currentObj.pickedobjvalue_dom.innerHTML = name;
	};
	
	
	this.resize = function(in_gl){
		if (DEBUG){
			console.log("[FVView::resize]");
		}
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;
	    
	    var newWidthToHeight = newWidth / newHeight;

	    if (newWidthToHeight > currentObj.widthToHeight) {
	        newWidth = newHeight * currentObj.widthToHeight;
	        currentObj.container.style.height = (newHeight * 0.66) + 'px';
	        currentObj.container.style.width = (newWidth  * 0.66) + 'px';
	    } else {
	        newHeight = newWidth / currentObj.widthToHeight;
	        currentObj.container.style.width = (newWidth  * 0.66) + 'px';
	        currentObj.container.style.height = (newHeight * 0.66) + 'px';
	    }

	    currentObj.canvas.width = (newWidth  * 0.66) - 10;
	    currentObj.canvas.height = (newHeight * 0.66) - 10;
	    in_gl.viewportWidth = currentObj.canvas.width;
	    in_gl.viewportHeight = currentObj.canvas.height; 

	    currentObj.controlpanel.style.top = '0px';
	    currentObj.controlpanel.style.height = currentObj.canvas.height + 'px';
	    currentObj.controlpanel.style.width = (window.innerWidth  * 0.30) + 'px';
		
	    if (DEBUG){
			console.log("[FVView::resize][canvas] " + currentObj.canvas.width + " " + currentObj.canvas.height);
		   	console.log("[FVView::resize][gl] " + in_gl.viewportWidth + " " + in_gl.viewportHeight);
		}
	   	
		
	};
	
	this.init();
	
	
}
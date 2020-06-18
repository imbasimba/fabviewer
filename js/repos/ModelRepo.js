/**
 * @author Fabrizio Giordano (Fab)
 */
function ModelRepo(in_gl, in_canvas, in_catalogueCallback){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.objModels = [];
//		currentObj.catalogues = [];
		
//		currentObj.objModels[0] = new Moon(2, in_gl, in_canvas, [0.0, 0.0, -7.0], 0, 0, "Moon");
				
		var sphericalPhiThetaRad = {
				phi: 0.0,
				theta: 0.0
		};
		

		currentObj.objModels[0] = new HiPS(1, in_gl, in_canvas, [0.0, 0.0, 0.0], 
				Math.PI / 2, 
				Math.PI / 2, "HiPS");
				
		var raHMS = "16 28 24.504";
		var decDMS = "-26 39 06.06";
		
		
		raHMS = raHMS.split(" ");
		decDMS = decDMS .split(" ");
		
		var raDeg = hms2RaDeg({
			h:Number(raHMS[0]), 
			m:Number(raHMS[1]), 
			s:Number(raHMS[2])
			});
		var decDeg = dms2DecDeg({
			d:Number(decDMS[0]), 
			m:Number(decDMS[1]), 
			s:Number(decDMS[2])
			});
		
//		currentObj.getJSON("https://sky.esa.int/esasky-tap/catalogs", currentObj.loadCatalogues);
		
	};
	
//	this.loadCatalogues = function(err, data) {
//		if (err !== null) {
//			alert('Something went wrong: ' + err);
//		} else {
//			console.log("Catalogue descriptors loaded");
//			console.log(data);
//			currentObj.catalogues = data;
//			in_catalogueCallback(data);
//		}
//		
//		
//	};
//
//	
//	this.getJSON = function(url, callback) {
//	    var xhr = new XMLHttpRequest();
//	    xhr.open('GET', url, true);
//	    xhr.responseType = 'json';
//	    xhr.onload = function() {
//	      var status = xhr.status;
//	      if (status === 200) {
//	        callback(null, xhr.response);
//	      } else {
//	        callback(status, xhr.response);
//	      }
//	    };
//	    xhr.send();
//	};
	
	this.init();
}
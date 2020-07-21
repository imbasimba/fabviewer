function CatalogueRepo(_descriptorURL, _addCataloguesCallback){
 
    var descriptorURL;
    var catalogues = [];
    
 
    function init(){
    	descriptorURL = _descriptorURL;
    	getJSON(descriptorURL);
    }

    function getJSON(url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = () =>  {
			var status = xhr.status;
			if (status === 200) {
				loadCatalogues(null, xhr.response);
			} else {
				loadCatalogues(status, xhr.response);
			}
		};
		
		
		xhr.send();
	}
    
    function loadCatalogues(err, data) {
		if (err !== null) {
			alert('Something went wrong: ' + err);
		} else {
//			console.log("Catalogue descriptors loaded");
//			console.log(data);
			catalogues = data;
			_addCataloguesCallback(data);
		}
	}


    var _public = {
		
    	getCatalogues: function(){
    		return catalogues;
    	}
	}
 
	init();
	return _public;
}



/**
 * tableName: tap table name
 * fov: array of RA, Dec (double)
 * callback: function from view to fill results 
 */
CatalogueRepo.retriveByFoV = function(url, descriptor, callback){
	
	var xhr = new XMLHttpRequest();
	
	var tapTable = descriptor.getTapTable();
	var raDeg = descriptor.getRaTapColumn();
    var decDeg = descriptor.getDecTapColumn();
    var name = descriptor.getNameTapColumn();
	
	var fovPolyCartesian = FoVUtils.getFoVPolygon (global.pMatrix, global.camera, global.gl.canvas, global.model, global.rayPicker);
	var fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
	console.log("Into CatalogueRepo.retriveByFoV");
	console.log(fovPolyAstro);
	var adqlQuery = "select top 2000 * " +
			"from "+tapTable+" where " +
			"1=CONTAINS(POINT('ICRS',"+raDeg+", "+decDeg+"), " +
			"POLYGON('ICRS', "+fovPolyAstro+"))";
	var queryString = "/esasky-tap/tap/sync?request=doQuery&lang=ADQL&format=json&query="+encodeURI(adqlQuery);
	
	
	xhr.open('GET', url+queryString, true);
	xhr.responseType = 'json';
	xhr.onload = () =>  {
		var status = xhr.status;
		if (status === 200) {
			console.log(xhr.response);
		} else {
			alert('Something went wrong: ' + xhr.response);
		}
	};
	
	
	xhr.send();
	
};

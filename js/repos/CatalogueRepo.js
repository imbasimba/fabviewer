function CatalogueRepo(_descriptorURL, _addCataloguesCallback){
 
    var descriptorURL;
    var catalogues = [];
    
 
    function init(){
    	descriptorURL = _descriptorURL;
    	getJSON(descriptorURL, loadCatalogues);
    }

    function getJSON(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
			var status = xhr.status;
			if (status === 200) {
				callback(null, xhr.response);
			} else {
				callback(status, xhr.response);
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
CatalogueRepo.retriveByFoV = function(tableName, fov, callback){
	
};

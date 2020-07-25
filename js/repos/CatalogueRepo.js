"use strict";

class CatalogueRepo{
	
	#descriptorURL = null;
	#catalogueDescriptors = [];
	static #catalogues = [];
	self;
	
	
	/** 
	 * @param in_descriptorURL: URI to the JSON descriptor file
	 * @param in_addCataloguesCallback: callback with the retrieved descriptor JSON
	 */
	constructor(in_descriptorURL, in_addCataloguesCallback){
		
		this.#descriptorURL = in_descriptorURL;
		self = this;
		this.getDescriptorJSON(in_addCataloguesCallback);
	}
	
	getDescriptorJSON(in_addCataloguesCallback){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.#descriptorURL, true);
		xhr.responseType = 'json';
		xhr.onload = () =>  {
			var status = xhr.status;
			if (status === 200) {
				self.loadCatalogues(in_addCataloguesCallback, null, xhr.response);
			} else {
				self.loadCatalogues(in_addCataloguesCallback, status, xhr.response);
			}
		};
		xhr.send();
	}
	
	
	
	loadCatalogues(callback, err, data) {
		if (err !== null) {
			alert('Something went wrong: ' + err);
		} else {
			this.#catalogueDescriptors.push(data);
			callback(data);
		}
	}

	static get catalogues(){
		return this.#catalogues;
	}
	
	/**
	 * @param catalogue: Catalogue.js
	 */
	static addCatalogue(catalogue){
		this.#catalogues.push(catalogue);
	}
	
	static retriveByFoV(url, descriptor, callback){
		
		var xhr = new XMLHttpRequest();
		
		var tapTable = descriptor.tapTable;
		var tapRaDeg = descriptor.raTapColumn;
	    var tapDecDeg = descriptor.decTapColumn;
	    var tapName = descriptor.nameTapColumn;
	    var name = descriptor.name;
		
		var fovPolyCartesian = FoVUtils.getFoVPolygon (global.pMatrix, global.camera, global.gl.canvas, global.model, global.rayPicker);
		var fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
		var adqlQuery = "select top 4000 * " +
				"from "+tapTable+" where " +
				"1=CONTAINS(POINT('ICRS',"+tapRaDeg+", "+tapDecDeg+"), " +
				"POLYGON('ICRS', "+fovPolyAstro+"))";
		var queryString = "/esasky-tap/tap/sync?request=doQuery&lang=ADQL&format=json&query="+encodeURI(adqlQuery);
		console.log(queryString);
		
		xhr.open('GET', url+queryString, true);
		xhr.responseType = 'json';
		xhr.onload = () =>  {
			var status = xhr.status;
			if (status === 200) {
				var metadata = xhr.response.metadata;
				var data = xhr.response.data;
//				console.log(xhr.response);
//				alert(JSON.stringify(xhr.response));
				console.log(metadata);
				console.log(data);
				
				var i,
				raIdx = null,
				decIdx = null,
				nameIdx = null,
				k = 0;
				
				for (i = 0; i < metadata.length; i++){
//					console.log("name: "+metadata[i].name+", datatype: "+metadata[i].datatype);
					if (metadata[i].name == tapRaDeg){
						raIdx = i;
						k += 1;
					}else if(metadata[i].name == tapDecDeg){
						decIdx = i;
						k += 1;
					}else if(metadata[i].name == tapName){
						nameIdx = i;
						k += 1;
					}
					
					if (k == 3){
						break;
					}
				}
				
				var catalogue = new Catalogue(name, metadata, raIdx, decIdx, nameIdx);
				
				catalogue.addSources(data);
				
//				var j,
//				source,
//				point;
//				
//				for ( j = 0; j < data.length; j++){
//					
//					point = new Point({
//						raDeg: data[raIdx],
//						decDeg: data[decIdx]
//					}, CoordsType.ASTRO);
//					
//					source = new Source(point, data[nameIdx], data[j]);
//					catalogue.addSource(source);
//				} 
				
				CatalogueRepo.addCatalogue(catalogue);
				
				
				
				
			} else {
				alert('Something went wrong: ' + xhr.response);
			}
		};
		
		
		xhr.send();
		
	}
}

//
//function CatalogueRepo(_descriptorURL, _addCataloguesCallback){
// 
//    var descriptorURL;
//    var catalogues = [];
//    
// 
//    function init(){
//    	descriptorURL = _descriptorURL;
//    	getJSON(descriptorURL);
//    }
//
//    function getJSON(url) {
//		var xhr = new XMLHttpRequest();
//		xhr.open('GET', url, true);
//		xhr.responseType = 'json';
//		xhr.onload = () =>  {
//			var status = xhr.status;
//			if (status === 200) {
//				loadCatalogues(null, xhr.response);
//			} else {
//				loadCatalogues(status, xhr.response);
//			}
//		};
//		
//		
//		xhr.send();
//	}
//    
//    function loadCatalogues(err, data) {
//		if (err !== null) {
//			alert('Something went wrong: ' + err);
//		} else {
////			console.log("Catalogue descriptors loaded");
////			console.log(data);
//			catalogues = data;
//			_addCataloguesCallback(data);
//		}
//	}
//
//
//    var _public = {
//		
//    	getCatalogues: function(){
//    		return catalogues;
//    	}
//	}
// 
//	init();
//	return _public;
//}
//
//
//
///**
// * tableName: tap table name
// * fov: array of RA, Dec (double)
// * callback: function from view to fill results 
// */
//CatalogueRepo.retriveByFoV = function(url, descriptor, callback){
//	
//	var xhr = new XMLHttpRequest();
//	
//	var tapTable = descriptor.tapTable;
//	var raDeg = descriptor.raTapColumn;
//    var decDeg = descriptor.decTapColumn;
//    var name = descriptor.nameTapColumn;
//	
//	var fovPolyCartesian = FoVUtils.getFoVPolygon (global.pMatrix, global.camera, global.gl.canvas, global.model, global.rayPicker);
//	var fovPolyAstro = FoVUtils.getAstroFoVPolygon(fovPolyCartesian);
////	console.log("Into CatalogueRepo.retriveByFoV");
////	console.log(fovPolyAstro);
//	var adqlQuery = "select top 2000 * " +
//			"from "+tapTable+" where " +
//			"1=CONTAINS(POINT('ICRS',"+raDeg+", "+decDeg+"), " +
//			"POLYGON('ICRS', "+fovPolyAstro+"))";
//	var queryString = "/esasky-tap/tap/sync?request=doQuery&lang=ADQL&format=json&query="+encodeURI(adqlQuery);
//	console.log(queryString);
//	
//	xhr.open('GET', url+queryString, true);
//	xhr.responseType = 'json';
//	xhr.onload = () =>  {
//		var status = xhr.status;
//		if (status === 200) {
//			console.log(xhr.response);
//			alert(JSON.stringify(xhr.response));
//		} else {
//			alert('Something went wrong: ' + xhr.response);
//		}
//	};
//	
//	
//	xhr.send();
//	
//};

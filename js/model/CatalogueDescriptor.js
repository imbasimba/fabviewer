"use strict";

class CatalogueDescriptor{
	
	#name;
	#tapTable;
	#raTapColumn;
	#decTapColumn;
	#nameTapColumn;
	#shapeColor;
	
	
	constructor(in_catalogueDescriptorJSON){
		
		this.#name = in_catalogueDescriptorJSON.guiShortName;
		this.#tapTable = in_catalogueDescriptorJSON.tapTable;
		this.#raTapColumn = in_catalogueDescriptorJSON.polygonRaTapColumn;
		this.#decTapColumn = in_catalogueDescriptorJSON.polygonDecTapColumn;
		this.#nameTapColumn = in_catalogueDescriptorJSON.polygonNameTapColumn;
		this.#shapeColor = in_catalogueDescriptorJSON.histoColor;
        
	}
	
	get name(){
		return this.#name;
	}
	
	get tapTable(){
		return this.#tapTable;
	}
	
	get raTapColumn(){
    	return this.#raTapColumn;
    }
	
    get decTapColumn(){
    	return this.#decTapColumn;
    }
    
    get nameTapColumn(){
    	return this.#nameTapColumn;
    }
    
    get shapeColor(){
    	return this.#shapeColor;
    } 
	
}
//
//function CatalogueDescriptor(_catalogueDescriptorJSON){
// 
//	var name;
//	var tapTable;
//	var raTapColumn;
//	var decTapColumn;
//	var nameTapColumn;
//	var shapeColor;
//	
//    function init(){    	
////      console.log("Inside CatalogueDescriptor");
////      console.log(_catalogueDescriptorJSON);
//    	name = _catalogueDescriptorJSON.guiShortName;
//        tapTable = _catalogueDescriptorJSON.tapTable;
//        raTapColumn = _catalogueDescriptorJSON.polygonRaTapColumn;
//        decTapColumn = _catalogueDescriptorJSON.polygonDecTapColumn;
//        nameTapColumn = _catalogueDescriptorJSON.polygonNameTapColumn;
//        shapeColor = _catalogueDescriptorJSON.histoColor;
//
//    }
// 
//    var _public = {
//        getName: function(){
//            return name;
//        },
//        getTapTable: function(){
//        	return tapTable;
//        },
//        getRaTapColumn: function(){
//        	return raTapColumn;
//        },
//        getDecTapColumn: function(){
//        	return decTapColumn;
//        },
//        getNameTapColumn: function(){
//        	return nameTapColumn;
//        },
//        getShapeColor: function(){
//        	return shapeColor;
//        }
//    }
// 
//    init();
//    return _public;
//}
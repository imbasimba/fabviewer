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
    
    get shapeColorHex(){
    	return this.#shapeColor;
    }
    
    get shapeColorRgb(){
//    	Utils.
    	
    	return this.#shapeColor;
    }
	
}

export default CatalogueDescriptor;

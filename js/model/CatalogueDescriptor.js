function CatalogueDescriptor(_catalogueDescriptorJSON){
 
	var name;
	var tapTable;
	var raTapColumn;
	var decTapColumn;
	var nameTapColumn;
	var shapeColor;
	
    function init(){    	
//      console.log("Inside CatalogueDescriptor");
//      console.log(_catalogueDescriptorJSON);
    	name = _catalogueDescriptorJSON.guiShortName;
        tapTable = _catalogueDescriptorJSON.tapTable;
        raTapColumn = _catalogueDescriptorJSON.polygonRaTapColumn;
        decTapColumn = _catalogueDescriptorJSON.polygonDecTapColumn;
        nameTapColumn = _catalogueDescriptorJSON.polygonNameTapColumn;
        shapeColor = _catalogueDescriptorJSON.histoColor;

    }
 
    var _public = {
        getName: function(){
            return name;
        },
        getTapTable: function(){
        	return tapTable;
        },
        getRaTapColumn: function(){
        	return raTapColumn;
        },
        getDecTapColumn: function(){
        	return decTapColumn;
        },
        getNameTapColumn: function(){
        	return nameTapColumn;
        },
        getShapeColor: function(){
        	return shapeColor;
        }
    }
 
    init();
    return _public;
}
function CatalogueDescriptor(_catalogueDescriptorJSON){
 
	var name;
	
    function init(){    	
        name = _catalogueDescriptorJSON.guiShortName;
//        console.log(name);
    }
 
    var _public = {
        getName: function(){
            return name;
        }
    }
 
    init();
    return _public;
}
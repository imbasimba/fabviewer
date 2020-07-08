function CatalogueListPresenter(_view){
 
	var view;
    var model;
     
    function init(_view){
//    	console.log(_view);
    	view = _view;
         
    }
 
    var _public = {
        getView: function(){
            return view;
        },
        addCatalogues: function(catalogueDescriptorJSON){
        	
        	for (let [key, catalogue] of Object.entries(catalogueDescriptorJSON.descriptors) ) {
        		var model = new CatalogueDescriptor(catalogue);
                var cataloguePresenter = new CataloguePresenter(new CatalogueView());
                cataloguePresenter.setModel(model);
                view.addCatalogue(cataloguePresenter.getView());
        	}
        }
    
    
    }
 
    init(_view);
    return _public;
}
"use strict";
//function CatalogueListPresenter(_view){
// 
//	var view;
//    var model;
//     
//    function init(_view){
////    	console.log(_view);
//    	view = _view;
//         
//    }
// 
//    var _public = {
//        getView: function(){
//            return view;
//        },
//        addCatalogues: function(catalogueDescriptorJSON){
//        	
//        	for (let [key, catalogue] of Object.entries(catalogueDescriptorJSON.descriptors) ) {
//        		var model = new CatalogueDescriptor(catalogue);
//                var cataloguePresenter = new CataloguePresenter(new CatalogueView());
//                cataloguePresenter.model = model;
//                view.addCatalogue(cataloguePresenter.view);
//        	}
//        }
//    
//    
//    }
// 
//    init(_view);
//    return _public;
//}

class CatalogueListPresenter{
	
	_view = null;
	_model = null;
	
	constructor(in_view){
		
		this._view = in_view;
		this._model = null;
//		var _self = this;
	}
	
	get view(){
        return this._view;
    }
	
	// this cause a syntax error in Eclipse 4.15.0 since it doesn't support ES6 
	addCatalogues = (catalogueDescriptorJSON) => {
    	
    	for (let [key, catalogue] of Object.entries(catalogueDescriptorJSON.descriptors) ) {
    		let model = new CatalogueDescriptor(catalogue);
            let cataloguePresenter = new CataloguePresenter(new CatalogueView());
            cataloguePresenter.model = model;
            this._view.addCatalogue(cataloguePresenter.view);
    	}
    }
	
	
}
"use strict";
//function CataloguePresenter(_view){
// 
//    var view;
//    var model;
// 
//    function init(_view){
//        view = _view;
//        view.addCheckedHandler(function(){
//            // TODO call ModelRepo to retrieve metadata with the current FoV
//        	console.log("// TODO call ModelRepo to retrieve metadata with the current FoV");
//        	
//        });
//    }
// 
//    var _public = {
//        getView: function(){
//            return view;
//        },
//        setModel: function(_model){	// of type 
//            model = _model;
//            view.setModel(model);
//        }
//    }
// 
//    init(_view);
//    return _public;
//}


class CataloguePresenter{
	
	constructor(in_view){
		this._view = in_view;
		
		
//		this._view.addCheckedHandler(function(){
//            // TODO call ModelRepo to retrieve metadata with the current FoV
//        	console.log("// TODO call CatalogueRepo to retrieve metadata with the current FoV");
//        	console.log(this._model);
//        });
		
		var self = this;
		
		this._view.addCheckedHandler(function(){
            // TODO call ModelRepo to retrieve metadata with the current FoV
        	console.log("// TODO call CatalogueRepo to retrieve metadata with the current FoV");
        	console.log(self._model);
        	CatalogueRepo.retriveByFoV("https://sky.esa.int/", self._model, null);
        });
		
		this._model = null;
	}
	
	get view(){
        return this._view;
    }
	
    set model(in_model){	// of type 
        this._model = in_model;
        this._view.setModel(this._model);
    }

}
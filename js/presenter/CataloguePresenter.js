"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
class CataloguePresenter{
	
	constructor(in_view){
		this._view = in_view;

		
		var self = this;
		
		this._view.addCheckedHandler(function(){
        	console.log("// TODO call CatalogueRepo to retrieve metadata with the current FoV");
        	console.log(self._model);
        	var results = CatalogueRepo.retriveByFoV("https://sky.esa.int/", self._model, null);
            // TODO overlay results
        	

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
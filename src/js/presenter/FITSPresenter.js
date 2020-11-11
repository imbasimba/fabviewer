"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */

class FITSPresenter {

	constructor(in_view, enableFitsCallback){
		this._view = in_view;

		
		this._view.addCheckedHandler(function(){

			var checkbox = this;
			
			if (checkbox.checked){
				console.log("FITS enabled");
				enableFitsCallback(true);
			}else{
				console.log("FITS disabled");
				enableFitsCallback(false);
			}
        	


        });
		
	}
	
	get view(){
        return this._view;
    }
	
	
}

export default FITSPresenter;
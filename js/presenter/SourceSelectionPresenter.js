/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

class SourceSelectionPresenter {
 
	#view;
	
	constructor (in_view) {
		this.#view = in_view;
		var self = this;
		window.addEventListener('sourceSelected', function (e) {
//			console.log(e);
			self.refreshModel(e.detail);
			}, false);
	}
	
	get view () {
		return this.#view;
	}
	
	refreshModel (in_model) {
//		console.log("refreshModel "+in_model);
		this.#view.model = in_model;
	}
	
}
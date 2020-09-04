/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

import $ from "jquery";
class SourceSelectionView {
	
	#html;
	
	constructor () {
		this.#html = $("<div id='selection'>"
				+"</div>");
	}
	
	get html(){
		return this.#html;
	}
	
	
	set model (in_model) {
//		console.log(in_model);
		
		var content = "";
		for (var i = 0; i < in_model.length; i++){
			content += in_model[i].name+"<br>";
		}
		
		$("#selection").html(content);
	}
	
}

export default SourceSelectionView;

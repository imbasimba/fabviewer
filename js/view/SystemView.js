/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

function SystemView() {

	var html;
	var i = 0;

	function init() {
		console.log("SystemView.init()");
		html = $("<div id='fps'>"
				+ "<table style='width: 100%; text-align: center;'>" 
				+ "	<tr>"
				+ "	<th>FPS</th>"
				+ "	<th>Avg FPS</th>" 
				+ "</tr><tr>"
				+ "	<td><div id='fpsvalue'></div></td>"
				+ "	<td><div id='avgfpsvalue'></div></td>" 
				+ "</tr>"
				+ "</table></div>");
	}

	var _public = {

		getHtml : function() {
			return html;
		},
		setModel : function(model) {
			$("#fpsvalue").html(model.getFps());
			$("#avgfpsvalue").html(model.getAvgFps());
		}
	}

	init();
	return _public;
}
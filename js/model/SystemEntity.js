/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

function SystemEntity(){
 
	var fps;
	var avgfps;
	
    function init(){
    	console.log("SystemEntity.init()");
    }
 
    var _public = {
    		getFps: function(){
                return fps;
            },
    
		    getAvgFps: function(){
		        return avgfps;
		    },
		    
		    setFps: function(_fps){
                fps = _fps.toFixed(1);
            },
    
		    setAvgFps: function(_avgfps){
		        avgfps = _avgfps.toFixed(1);
		    }
    }
 
    init();
    return _public;
}
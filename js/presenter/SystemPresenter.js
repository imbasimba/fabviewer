/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

function SystemPresenter(_view){
 
    var view;
    var model;	// of type SystemEntity
 
    var frameTimes;
    var frameCursor;
    var numFrames;   
    var maxFrames;
    var totalFPS;
    var fps;
    var lastDrawTime;
    var averageFPS;
    var elapsedTime;
    
    var systemEntity;
    
    
    function init(_view){
//    	console.log("SystemPresenter.init()");
        view = _view;
//        view.addFovPolyHandler(function(){
//            // TODO call FovUtils.getFovPoly()
//        	console.log("TODO call FovUtils.getFovPoly()");
//        	
//        });
        frameTimes = [];
        frameCursor = 0;
        numFrames = 0;   
        maxFrames = 20;
        totalFPS = 0;
        fps = 0;
        var now = (new Date()).getTime() * 0.001;
        lastDrawTime = now;
        model = new SystemEntity();
        
        
    }
    
    function setModel(){
    	
    	var now = (new Date()).getTime() * 0.001;
    	
		elapsedTime = now - lastDrawTime;
		lastDrawTime = now;
		
		fps = 1 / elapsedTime;

		// add the current fps and remove the oldest fps
		totalFPS += fps - (frameTimes[frameCursor] || 0);
		// record the newest fps
		frameTimes[frameCursor++] = fps;
		// needed so the first N frames, before we have maxFrames, is correct.
		numFrames = Math.max(numFrames, frameCursor);
		// wrap the cursor
		frameCursor %= maxFrames;
		averageFPS = totalFPS / numFrames;

		model.setFps(fps);
		model.setAvgFps(averageFPS);
		

    }
 
    var _public = {
        getView: function(){
            return view;
        },
//        setModel: function(_model){	// of type SystemEntity
//            model = _model;
//            view.setModel(model);
//        },
        refreshModel: function(){
        	
            setModel();
            view.setModel(model);
            
        },
        getElapsedTime: function(){
        	return elapsedTime;
        },
        getFovPoly: function(){
        	
        },
        addFovPolyHandler: function(handler){
        	view.addFovPolyHandler(function(){
                // TODO call FovUtils.getFovPoly()
            	handler();
            	
            });
        }
        
    }
 
    init(_view);
    return _public;
}
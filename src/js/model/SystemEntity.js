/**
 * @author Fabrizio Giordano (Fab)
 */
"use strict";

class SystemEntity{
    constructor(){
        this.fps = 0;
        this.avgfps = 0;
    }
    getFps(){
        return this.fps;
    }

    getAvgFps(){
        return this.avgfps;
    }
    
    setFps(_fps){
        this.fps = _fps.toFixed(1);
    }

    setAvgFps(_avgfps){
        this.avgfps = _avgfps.toFixed(1);
    }
}
export default SystemEntity;
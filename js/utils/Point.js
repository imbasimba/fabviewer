"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
class Point{
	
	constructor(in_xyz){
		
		this._x = in_xyz[0];
		this._y = in_xyz[1];
		this._z = in_xyz[2];
		this._raDecDeg = this.computeAstroCoords(in_xyz);
		
	}
	
	computeAstroCoords(in_xyz){
    	var phiThetaDeg = Utils.cartesianToSpherical([in_xyz[0], in_xyz[1], in_xyz[2]]);
		var raDecDeg = Utils.sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
		var raDecDeg = [raDecDeg.ra, raDecDeg.dec];
		return raDecDeg;
    }
	
	get x(){
		return this._x;
	}
	
	get y(){
		return this._y;
	}
	
	get z(){
		return this._z;
	}
	
	get xyz(){
        return [this._x, this._y, this._z];
    }
	
    get raDeg(){
        return this._raDecDeg[0];
    }
    
    get decDeg(){
        return this._raDecDeg[1];
    }
    
    get raDecDeg(){
        return this._raDecDeg;
    }
    
    toString(){
    	return this._raDecDeg[0]+","+this._raDecDeg[1];
    }
}


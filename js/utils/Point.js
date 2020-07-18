function Point(in_xyz){
 
    var x, y, z;
    var raDeg, decDeg;
 
    function init(){
    	x = in_xyz[0];
    	y = in_xyz[1];
    	z = in_xyz[2];
    	computeAstroCoords();
    }
    
    function computeAstroCoords(){
    	var phiThetaDeg = Utils.cartesianToSpherical([x, y, z]);
		var raDecDeg = Utils.sphericalToAstroDeg(phiThetaDeg.phi, phiThetaDeg.theta);
		raDeg = raDecDeg.ra;
		decDeg = raDecDeg.dec;
    }
 
    var _public = {

		getX: function(){
            return x;
        },
        getY: function(){
            return y;
        },
        getZ: function(){
            return z;
        },
        getXYZ: function(){
            return [x, y, z];
        },
        getRADeg: function(){
            return raDeg;
        },
        getDecDeg: function(){
            return decDeg;
        },
        getRADecDeg: function(){
            return [raDeg, decDeg];
        }
    }
 
    init();
    return _public;
}
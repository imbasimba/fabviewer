/**
 * @author Fabrizio Giordano (Fab)
 */


function Utils(){
	
}

function cartesianToSpherical(xyz){
	var dotXYZ = vec3.dot(xyz, xyz);

	var r = Math.sqrt(dotXYZ);

	
//	console.log("################");
//	console.log("xyz "+xyz);
//	console.log("r "+r);
//	console.log("dotXYZ "+dotXYZ);
	
	
	var theta = Math.acos(xyz[2]/r);
//	console.log("theta "+theta);
	theta = radToDeg(theta);
	
	// NB: in atan(y/x) is written with params switched atan2(x, y)
	var phi = Math.atan2(xyz[1],xyz[0]);
//	console.log("phi "+phi);
	phi = radToDeg(phi);
	if (phi < 0){
		phi += 360;
	}
//	console.log("phideg "+phi+" thetadeg"+ theta);
//	console.log("################");
	
	return {
		phi: phi, 
		theta: theta
	};
	
}


Utils.colorHex2RGB = function(hexColor){

//	console.log(hexColor);
	var hex1 = hexColor.substring(1,3);
	var hex2 = hexColor.substring(3,5);
	var hex3 = hexColor.substring(5,7);
	
	var dec1 = parseInt(hex1, 16);
	var dec2 = parseInt(hex2, 16);
	var dec3 = parseInt(hex3, 16);
	
	var rgb1 = (dec1 / 255).toFixed(2);
	var rgb2 = (dec2 / 255).toFixed(2);
	var rgb3 = (dec3 / 255).toFixed(2);
	
	return [parseFloat(rgb1), parseFloat(rgb2), parseFloat(rgb3)];

}

Utils.cartesianToSpherical = function(xyz){
	
	var dotXYZ = vec3.dot(xyz, xyz);

	var r = Math.sqrt(dotXYZ);	
	
	var theta = Math.acos(xyz[2]/r);
	theta = radToDeg(theta);
	
	// NB: in atan(y/x) is written with params switched atan2(x, y)
	var phi = Math.atan2(xyz[1],xyz[0]);
	phi = radToDeg(phi);
	if (phi < 0){
		phi += 360;
	}

	return {
		phi: phi, 
		theta: theta
	};
};

export function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

export function radToDeg(radians) {
	return radians * 180 / Math.PI;
}

function sphericalToAstroDeg(phiDeg, thetaDeg){
	
	var raDeg, decDeg;
//	raDeg = 90 - phiDeg;
	raDeg = phiDeg;
	if (raDeg < 0){
		raDeg += 360;
	}
	
	decDeg = 90 - thetaDeg;
	
	return {
		ra: raDeg,
		dec: decDeg
	};
}


Utils.sphericalToAstroDeg = function(phiDeg, thetaDeg){
	var raDeg, decDeg;
//	raDeg = 90 - phiDeg;
	raDeg = phiDeg;
	if (raDeg < 0){
		raDeg += 360;
	}
	
	decDeg = 90 - thetaDeg;
	
	return {
		ra: raDeg,
		dec: decDeg
	};

};

Utils.astroDegToSpherical = function(raDeg, decDeg){
	var phiDeg, thetaDeg;
//	phiDeg = 90 - raDeg;
	phiDeg = raDeg;
	if (phiDeg < 0){
		phiDeg += 360;
	}
	
	thetaDeg = 90 - decDeg;
	
	return {
		phi: phiDeg,
		theta: thetaDeg
	};
};

Utils.sphericalToCartesian = function(phiDeg, thetaDeg, r){
	
	
	var x = r * Math.sin(degToRad(thetaDeg)) * Math.cos(degToRad(phiDeg));
	var y = r * Math.sin(degToRad(phiDeg)) * Math.sin(degToRad(thetaDeg));
	var z = r * Math.cos(degToRad(thetaDeg));
	return [x, y, z];
};


function astroDegToSpherical(raDeg, decDeg){
	
	var phiDeg, thetaDeg;
//	phiDeg = 90 - raDeg;
	phiDeg = raDeg;
	if (phiDeg < 0){
		phiDeg += 360;
	}
	
	thetaDeg = 90 - decDeg;
	
	return {
		phi: phiDeg,
		theta: thetaDeg
	};
}




function raDegToHMS(raDeg){
	
	var h = Math.floor(raDeg/15);
	var m = Math.floor((raDeg/15 - h) * 60);
	var s = (raDeg/15 - h - m/60) * 3600;
	
	return {
		h: h, 
		m: m, 
		s: s
	};
}

function decDegToDMS(decDeg){
	
	
	var sign = 1;
	if (decDeg < 0){
		sign = -1;
	}
	
	var decDeg_abs = Math.abs(decDeg);
	var d = Math.trunc(decDeg_abs);
	
	var m = Math.trunc( (decDeg_abs - d) * 60);
	
	var s = (decDeg_abs - d - m/60) * 3600;
	d = d * sign;
	
	return {
		d: d, 
		m: m, 
		s: s
	};
}

function dms2DecDeg(decDMS){
	var sign = Math.sign(decDMS.d);
	var deg = (decDMS.d) + sign * (decDMS.m / 60) + sign * (decDMS.s/3600);
	return deg;
}

function hms2RaDeg(raHMS){
//	console.log(JSON.stringify(raHMS));
	var sign = Math.sign(raHMS.h);
	var deg = (raHMS.h + sign * (raHMS.m / 60) + sign * (raHMS.s/3600)) * 15;
//	console.log(deg);
	return deg;
}

function worldToModel(xy, radius){
	var x = xy[0];
	var y = xy[1];
	var z = Math.sqrt(radius*radius - xy[0]*xy[0] - xy[1]*xy[1]);
	
	return [x, y, z];
}

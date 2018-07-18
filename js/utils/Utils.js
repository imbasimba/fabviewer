/**
 * @author Fabrizio Giordano (Fab)
 */

function cartesianToSpherical(xyz){
	var dotXYZ = vec3.dot(xyz, xyz);

	var r = Math.sqrt(dotXYZ);
	
	var theta = Math.acos(xyz[2]/r);

	// NB: in atan(y/x) is written with params switched atan2(x, y)
	var phi = Math.atan2(xyz[0],xyz[1]);
	
	return {
		phi: radToDeg(phi), 
		theta: radToDeg(theta)
	};
	
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function radToDeg(radians) {
	return radians * 180 / Math.PI;
}

function sphericalToAstroDeg(phiDeg, thetaDeg){
	var raDeg, decDeg;
	raDeg = 90 - phiDeg;
	decDeg = 90 - thetaDeg;
	
	return {
		ra: raDeg, 
		dec: decDeg
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
	var d = Math.floor(decDeg);
	var m = Math.floor((decDeg - d) * 60);
	var s = (decDeg - d - m/60) * 3600;
	
	return {
		d: d, 
		m: m, 
		s: s
	};
}

/**
 * @author Fabrizio Giordano (Fab)
 */

function cartesianToSpherical(xyz){
	var dotXYZ = vec3.dot(xyz, xyz);

	var r = Math.sqrt(dotXYZ);

	
	console.log("################");
	console.log("xyz "+xyz);
	console.log("r "+r);
	console.log("dotXYZ "+dotXYZ);
	
	
	var theta = Math.acos(xyz[2]/r);
	console.log("theta "+theta);
	theta = radToDeg(theta);
	
	// NB: in atan(y/x) is written with params switched atan2(x, y)
	var phi = Math.atan2(xyz[1],xyz[0]);
	console.log("phi "+phi);
	phi = radToDeg(phi);
	if (phi < 0){
		phi += 360;
	}
	console.log("phideg "+phi+" thetadeg"+ theta);
	console.log("################");
	
	return {
		phi: phi, 
		theta: theta
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
//	raDeg = 90 - phiDeg;
	raDeg = Math.abs(phiDeg-360);
	if (raDeg < 0){
		raDeg += 360;
	}
	
	decDeg = 90 - thetaDeg;
	
	return {
		ra: raDeg,
		dec: decDeg
	};
}

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
	
	var d = Math.floor(decDeg);
	var m = Math.floor((decDeg - d) * 60);
	var s = (decDeg - d - m/60) * 3600;
	
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


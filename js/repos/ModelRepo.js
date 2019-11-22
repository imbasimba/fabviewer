/**
 * @author Fabrizio Giordano (Fab)
 */
function ModelRepo(in_gl, in_canvas){
	
	var currentObj = this;
	
	this.init = function (){
		currentObj.objModels = [];
		
//		currentObj.objModels[0] = new Moon(2, in_gl, in_canvas, [0.0, 0.0, -7.0], 0, 0, "Moon");
		
//		currentObj.objModels[1] = new HiPS(2, in_gl, in_canvas, [-6.0, 0.0, -7.0], 0, 0, "HiPS");
		
		var sphericalPhiThetaRad = {
				phi: 0.0,
				theta: 0.0
		};
		

		
		
//		currentObj.objModels[0] = new HiPS(2, in_gl, in_canvas, [0.0, 0.0, 0.0], 
//				degToRad(-90.0), 
//				0.0, "HiPS");
		
//		currentObj.objModels[0] = new HiPS(1, in_gl, in_canvas, [0.0, 0.0, 0.0], 
//				0.0, 
//				0.0, "HiPS");
		
//		/* 
//		 * to end up with (up, fwd, rgt) = (z, -x, y) we need these rotation in order:
//		 * 1. 90 deg on the x axis => (up, fwd, rgt) = (z, y, x)
//		 * 2. 90 deg on the z axis => (up, fwd, rgt) = (z, -x, y)
//		 * Rotation matrices must be applied in opposite order 
//		 */
//		// rotation around z axis (point 2.)
//		mat4.rotate(currentObj.R, Math.PI / 2, [0,0,1]);
//		// rotation around x axis (point 1.)
//		mat4.rotate(currentObj.R, Math.PI / 2, [1,0,0]);
		currentObj.objModels[0] = new HiPS(1, in_gl, in_canvas, [0.0, 0.0, 0.0], 
				Math.PI / 2, 
				Math.PI / 2, "HiPS");
		
		// Now rotating 
		
		
		var raHMS = "16 28 24.504";
		var decDMS = "-26 39 06.06";
		
//		console.log("raHMS "+raHMS);
//		console.log("decDMS "+decDMS);
		
		raHMS = raHMS.split(" ");
		decDMS = decDMS .split(" ");
		
		var raDeg = hms2RaDeg({
			h:Number(raHMS[0]), 
			m:Number(raHMS[1]), 
			s:Number(raHMS[2])
			});
		var decDeg = dms2DecDeg({
			d:Number(decDMS[0]), 
			m:Number(decDMS[1]), 
			s:Number(decDMS[2])
			});
		
//		var sphericalPhiThetaDeg = astroDegToSpherical(raDeg, decDeg);		
//		console.log("sphericalPhiThetaDeg" + JSON.stringify(sphericalPhiThetaDeg));
//		sphericalPhiThetaRad = {
//				phi: degToRad(sphericalPhiThetaDeg.phi+90),
//				theta: degToRad(sphericalPhiThetaDeg.theta)
//		};
//		console.log("sphericalPhiThetaRad" + JSON.stringify(sphericalPhiThetaRad));
//		currentObj.objModels[0].rotateFromZero(-sphericalPhiThetaRad.theta, sphericalPhiThetaRad.phi);
		//currentObj.objModels[0].rotate(-degToRad(0), degToRad(0+90));
//		currentObj.objModels[0].rotateFromZero(-degToRad(68), degToRad(85+90));
		
		
	};

	this.init();
}
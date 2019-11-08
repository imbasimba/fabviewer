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
		
		currentObj.objModels[0] = new HiPS(1, in_gl, in_canvas, [0.0, 0.0, 0.0], 
				0.0, 
				0.0, "HiPS");
		
		// Now rotating 
		
		
		var raHMS = "16 28 24.504";
		var decDMS = "-26 39 06.06";
		
		console.log("raHMS "+raHMS);
		console.log("decDMS "+decDMS);
		
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
		
		
		console.log("it should be RA: 247.1000 DEC: -26.6517");
		console.log("got RA "+raDeg+" DEC "+decDeg);
		
//		var complRa = 1.0 * (raDeg);
//		var complDec = 1.0 * (90 - decDeg);
		
		// it does correct dec rotation
//		var complRa = 1.0 * (- raDeg);
//		var phi =  raDeg;
//		var theta = 90.0 - decDeg;
//		var complDec = -1.0 * 90;
		
//		var complRa = 1.0 * (-raDeg);
//		var complDec = 0.0;
//		currentObj.objModels[0].rotate(degToRad(theta), degToRad(phi));
//		console.log("BUH!");
//		console.log(currentObj.objModels[0].R);
		
		// ref (ra,dec) (0,0) <-> (phi,theta) (90,90)
		// rot phi 247 = 112
		// rot theta 116 = 26
		
		//phi: 202 theta: 116
//		currentObj.objModels[0].rotate(degToRad(-116.0), degToRad(-247.0));
//		currentObj.objModels[0].rotate(0.0, 0.0);
		
		 
		
		
		var sphericalPhiThetaDeg = astroDegToSpherical(raDeg, decDeg);		
		console.log("sphericalPhiThetaDeg" + JSON.stringify(sphericalPhiThetaDeg));
		sphericalPhiThetaRad = {
				phi: degToRad(sphericalPhiThetaDeg.phi+90),
				theta: degToRad(sphericalPhiThetaDeg.theta)
		};
		console.log("sphericalPhiThetaRad" + JSON.stringify(sphericalPhiThetaRad));
		currentObj.objModels[0].rotateFromZero(-sphericalPhiThetaRad.theta, sphericalPhiThetaRad.phi);
		//currentObj.objModels[0].rotate(-degToRad(0), degToRad(0+90));
		currentObj.objModels[0].rotateFromZero(-degToRad(68), degToRad(85+90));
		
		
	};

	this.init();
}
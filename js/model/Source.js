class Source{
	
	#point;
	#name;
	#details;

	/**
	 * 
	 * @param in_point: Point.js
	 * @param in_name: String - source name
	 * @param in_details: Object {"key": <key>, "value": <value>, "valueType": <valueType>, "unit": <unit>}
	 */
	constructor(in_point, in_name, in_details=[]){
		this.#point = in_point;
		this.#name = in_name;
		this.#details = in_details;
	}

	get point(){
		return this.#point;
	}

}



//function Source(in_raDeg, in_decDeg, in_name, in_details){
//
//	var SourceObj = this;
//	
//	this.localInit = function(){
//		SourceObj.ra = in_ra;
//		SourceObj.dec = in_dec;
//		// TODO to be implemented into Utils.js
//		var xyz = astroDeg2Cartesian(in_raDeg, in_decDeg);
//		SourceObj.x = xyz[0];
//		SourceObj.y = xyz[1];
//		SourceObj.z = xyz[2];
//		SourceObj.keys = [];
//		
//		
//		for (var key in in_details) {
//			SourceObj.keys.push(key);
//		}	
//	};
//	
//	
//	this.localInit();
//	
//	
//	
//}
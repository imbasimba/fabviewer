"use strict";

import HealpixGridTile from './HealpixGridTile';

class HealpixGridTileBuffer {

	constructor() {
		this.tiles = {};
	}
	getTile(order, ipix){
		let tileKey = order + "/" + ipix;
		if(this.tiles[tileKey] == undefined){
			this.tiles[tileKey] = new HealpixGridTile(order, ipix, parent);
		}
		return this.tiles[tileKey];
	}
}
export const healpixGridTileBufferSingleton = new HealpixGridTileBuffer();
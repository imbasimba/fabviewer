"use strict";

import Tile from './Tile';

class TileBuffer {

	constructor() {
		this.tiles = {};
	}
	getTile(order, ipix){
		let tileKey = order + "/" + ipix;
		if(this.tiles[tileKey] == undefined){
			this.tiles[tileKey] = new Tile(order, ipix);
		}
		return this.tiles[tileKey];
	}
}
export const tileBufferSingleton = new TileBuffer();
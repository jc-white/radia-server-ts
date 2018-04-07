import {Component} from '@nestjs/common';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import {config} from '../../../../config/config.local';
import {Sanitizers} from '../../../shared/functions/sanitizers';

export class TiledTileMap {
	tileMapID: string;
	backgroundcolor: string;
	height: number;
	infinite: boolean;
	layers: Array<TiledLayer>;
	nextobjectid: number;
	orientation: 'orthagonal' | 'isometric' | 'staggered' | 'hexagonal';
	properties: Array<ITiledProperty>;
	renderorder: string;
	tiledversion: string;
	tileheight: number;
	tilesets: Array<TiledTileset>;
	tilewidth: number;
	type: 'map';
	version: number;
	width: number;

	tiles: ITileGrid = {};

	constructor(tileMapID: string, tileMapData: TiledTileMap) {
		Object.assign(this, tileMapData);
		this.tileMapID = tileMapID;

		if (this.layers && this.layers.length) {
			const chunks          = [],
			      grid: ITileGrid = {};

			this.layers.forEach((layer, index) => {
				this.layers[index] = new TiledLayer(layer);

				chunks.push(this.layers[index].chunkRows(this.width, this.height));
			});

			chunks.forEach(chunk => {
				for (let x = 0; x < this.width; x++) {
					for (let y = 0; y < this.height; y++) {
						if (!grid[x]) grid[x] = {};
						if (!grid[x][y]) grid[x][y] = [];

						grid[x][y].push(chunk[x][y]);
					}
				}
			});

			this.tiles = grid;
		}

		if (this.tilesets && this.tilesets.length) {
			this.tilesets.forEach((tileset, index) => {
				this.tilesets[index] = new TiledTileset(tileset);
			});
		}
	}

	getTileIDsAt(x: number, y: number): Array<number> {
		return this.tiles[x][y];
	}

	getTilesAt(x: number, y: number): Array<TiledTile> {
		const tiles = this.tiles[x][y].filter(tileID => tileID > 0);

		if (!tiles || !tiles.length) {
			console.error(`Out of range tile lookup: ${this.tileMapID} ${x},${y}`);
			return [];
		}

		return tiles.map(tileID => this.getTileFromTileset(tileID));
	}

	getTileFromTileset(tileID: number): TiledTile {
		const sortedTilesets = _.sortBy(this.tilesets, 'firstgid').reverse();

		const tileset = _.find(sortedTilesets, tileset => tileset.firstgid <= tileID);

		//We subtract tileset.firstgid here to convert a global GID to a local GID
		return tileset.tiles[tileID - tileset.firstgid] || new TiledTile(tileID - tileset.firstgid, {
			id: tileID - tileset.firstgid
		});
	}
}

export class TiledLayer {
	data: Array<number>;
	draworder: 'topdown' | 'index';
	height: number;
	layers: Array<TiledLayer>;
	name: string;
	objects: Array<any>;
	properties: Array<ITiledProperty>;
	type: 'tilelayer' | 'objectgroup' | 'imagelayer' | 'group';
	visible: boolean;
	width: number;
	x: 0;
	y: 0;

	constructor(layerData: TiledLayer) {
		Object.assign(this, layerData);

		if (this.data && !_.isEmpty(this.data)) {
			//this.data = new Buffer(layerData.data as any, 'base64').toJSON().data;
		}
	}

	chunkRows(width: number, height: number) {
		const grid = {};
		const rows = _.chunk(this.data, width);

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				if (!grid[x]) grid[x] = {};

				grid[x][y] = rows[x][y];
			}
		}

		return grid;
	}
}

export class TiledTileset {
	columns: number;
	firstgid: number;
	grid: any;
	image: string;
	imagewidth: number;
	imageheight: number;
	margin: number;
	name: string;
	properties: Array<ITiledProperty>;
	spacing: number;
	terrains: any;
	tilecount: number;
	tileheight: number;
	tileoffset: any;
	tiles: ITileList;
	tilewidth: number;
	type: 'tileset';

	constructor(tilesetData: TiledTileset) {
		Object.assign(this, tilesetData);

		if (this.tiles && !_.isEmpty(this.tiles)) {
			Object.keys(this.tiles).forEach((localTileID: any) => {
				this.tiles[localTileID] = new TiledTile(localTileID - this.firstgid, this.tiles[localTileID]);
			});
		}
	}
}

export class TiledTile {
	id: number;
	properties?: Array<ITiledProperty>;
	terrain?: any;
	probability?: number;
	image?: any;
	objectgroup?: ITiledObjectGroup;
	animation?: any;

	constructor(localTileID: number, tileData: ITiledTileData) {
		Object.assign(this, tileData);

		if (!this.id) {
			this.id = localTileID;
		}
	}

	isPassable() {
		if (this.objectgroup && this.objectgroup.objects && this.objectgroup.objects.length) {
			return !_.some(this.objectgroup.objects, object => {
				return object.type === ''; //Blank objects are treated as a pathing blocker
			});
		}

		return true;
	}
}

export interface ITileGrid {
	[x: number]: {
		[y: number]: Array<number>;
	}
}

export interface ITileList {
	[tileID: string]: TiledTile;
}

export interface ITiledTileData {
	id: number;
	properties?: Array<ITiledProperty>;
	terrain?: any;
	probability?: number;
	image?: any;
	objectgroup?: ITiledObjectGroup;
	animation?: any;
}

export interface ITiledProperty {
	name: string;
	value: string;
	type: string;
}

export interface ITiledObject {
	id: number;
	name?: string;
	type?: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	gid?: number;
	visible: boolean;
	template?: any;
}

export interface ITiledObjectGroup {
	name: string;
	color?: string;
	x: 0;
	y: 0;
	width: never;
	height: never;
	opacity: number;
	visible: boolean;
	offsetx?: number;
	offsety?: number;
	draworder: 'index' | 'topdown';
	objects: Array<ITiledObject>;
}

export interface ITileMapCache {
	tilemaps: {
		[tileMapID: string]: TiledTileMap
	},

	tilesets: {
		[tileSetID: string]: TiledTileset
	}
}

@Component()
export class TiledService {
	cache: ITileMapCache = {
		tilemaps: {},
		tilesets: {}
	};

	async getTilemap(tileMapID: string) {
		const tileMapIDClean = Sanitizers.alphaNumDash(tileMapID),
		      path           = `${config.paths.statics}\\tilemaps\\${tileMapIDClean}.json`;

		if (this.cache.tilemaps[tileMapIDClean]) return this.cache.tilemaps[tileMapIDClean];

		const exists = fs.existsSync(path);

		if (!exists) {
			console.error(`Tilemap ${tileMapIDClean} (${path}) does not exist!`);
			return false;
		}

		const contents = await fs.readJson(path, {encoding: 'utf8'});

		if (_.isEmpty(contents)) {
			console.error(`Tilemap ${tileMapIDClean} is empty!`);
			return false;
		}

		this.cache.tilemaps[tileMapIDClean] = new TiledTileMap(tileMapIDClean, contents);
	}
}
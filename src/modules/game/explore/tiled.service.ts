import {Component} from '@nestjs/common';
import * as fs from 'fs-extra';
import {Dictionary} from 'lodash';
import * as _ from 'lodash';
import {config} from '../../../../config/config.local';
import {Sanitizers} from '../../../shared/functions/sanitizers';
import * as Easystar from 'easystarjs';
import {ICoordPair} from './interfaces/explore.interface';
import {
	ITiledObjectGroup,
	ITiledPolyline,
	ITiledProperty,
	ITiledRegion,
	ITiledTileData,
	ITileGrid, ITileList, ITileMapCache
} from './interfaces/tiled.interface';

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

	tiles: ITileGrid                  = [];
	tilesUsed: Array<number>          = [];
	regions: Dictionary<ITiledRegion> = {};
	coords: Array<Array<number>>      = [];

	finder: Easystar.js = new Easystar.js();

	constructor(tileMapID: string, tileMapData: TiledTileMap) {
		Object.assign(this, tileMapData);
		this.tileMapID = tileMapID;

		if (this.tilesets && this.tilesets.length) {
			this.tilesets.forEach((tileset, index) => {
				this.tilesets[index] = new TiledTileset(tileset);
			});
		}

		this.buildCombinedGrid();
		this.buildPathingGrid();
		this.findRegions();
	}

	buildCombinedGrid() {
		if (this.layers && this.layers.length) {
			const layerGrids              = [],
			      combinedGrid: ITileGrid = [];

			this.layers.filter(layer => layer.type == 'tilelayer').forEach((layer, index) => {
				this.layers[index] = new TiledLayer(layer);

				layerGrids.push(this.layers[index].grid);
			});

			layerGrids.forEach(grid => {
				for (let x = 0; x < this.width; x++) {
					if (!combinedGrid[x]) combinedGrid[x] = [];

					for (let y = 0; y < this.height; y++) {
						if (!combinedGrid[x][y]) combinedGrid[x][y] = [];

						combinedGrid[x][y].push(grid[x][y]);

						this.coords.push([x, y]);
					}
				}
			});

			this.tiles     = combinedGrid;
			this.tilesUsed = _.uniq(_.flattenDeep(this.tiles as Array<any>));
		} else {
			console.log('Tilemap has no layers');
		}
	}

	buildPathingGrid() {
		const grid: Array<Array<number>> = [];

		for (let y = 0; y < this.height; y++) {
			let col = [];

			for (let x = 0; x < this.width; x++) {
				col.push(this.getTileIDAt(x, y, 'backgroundLayer'));
			}

			grid.push(col);
		}

		this.finder.setGrid(grid);
		this.setAcceptableTiles();
	}

	findRegions() {
		const regionLayer = this.layers.find(layer => layer.name == 'regionLayer');

		if (regionLayer) {
			regionLayer.objects.forEach((regionObject: ITiledPolyline) => {
				const newRegion: ITiledRegion = {
					regionID: regionObject.properties.regionID,
					keyTiles: regionObject.polyline.map(c => {
						return {
							x: (regionObject.x / 24) + (c.x / 24),
							y: (regionObject.y / 24) + (c.y / 24)
						}
					})
				};

				this.regions[newRegion.regionID] = newRegion;
			});
		}
	}

	setAcceptableTiles() {
		const tileset         = this.tilesets[0], //TODO: Support multiple tilesets
		      properties      = tileset.tileproperties,
		      acceptableTiles = [];

		this.tilesUsed.forEach(tile => {
			if (!properties) {
				acceptableTiles.push(tile);
				return;
			}

			const localTileID = tile - tileset.firstgid;

			if (properties[localTileID]) {
				if (!properties[localTileID].collide) {
					acceptableTiles.push(tile);
				}

				if (properties[localTileID].cost) {
					this.finder.setTileCost(tile, properties[localTileID].cost);
				}
			} else {
				acceptableTiles.push(tile);
			}
		});

		this.finder.setAcceptableTiles(acceptableTiles);
	}

	getPath(fromX: number, fromY: number, toX: number, toY: number, includeStart: boolean = true): Promise<Array<ICoordPair>> {
		return new Promise((resolve, reject) => {
			this.finder.findPath(fromX, fromY, toX, toY, (path: Array<ICoordPair>) => {
				if (path === null) {
					reject(null);
				} else {
					resolve(path);
				}
			});

			this.finder.calculate();
		});
	}

	getTileIDAt(x: number, y: number, layerName: string) {
		const layer = this.layers.find(l => l.name == layerName);

		if (!layer) {
			console.error('getTileIDAt: Invalid layer', layerName);
			return;
		}

		return layer.grid[x][y];
	}

	getTileAt(x: number, y: number, layerName: string) {
		const layer = this.layers.find(l => l.name == layerName);

		if (!layer) {
			console.error('getTileAt: Invalid layer', layerName);
			return;
		}

		return this.getTileFromTileset(layer[x][y]);
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

	getAllCoords() {

	}

	getTileFromTileset(tileID: number): TiledTile {
		const sortedTilesets = _.sortBy(this.tilesets, 'firstgid').reverse(),
		      tileset        = _.find(sortedTilesets, tileset => tileset.firstgid <= tileID);

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

	grid: Array<Array<number>>;

	constructor(layerData: TiledLayer) {
		Object.assign(this, layerData);

		if (this.data && !_.isEmpty(this.data)) {
			//this.data = new Buffer(layerData.data as any, 'base64').toJSON().data;
		}

		this.grid = this.asGrid(this.width);
	}

	asGrid(width: number) {
		const grid = [];
		const rows = _.chunk(this.data, width);

		rows.forEach((row, y) => {
			for (let x = 0; x < width; x++) {
				if (!grid[x]) grid[x] = [];

				grid[x][y] = row[x];
			}
		});

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
	tileproperties: Dictionary<Dictionary<any>>;
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

@Component()
export class TiledService {
	cache: ITileMapCache = {
		tilemaps: {},
		tilesets: {}
	};

	async getTilemap(tileMapID: string): Promise<TiledTileMap> {
		const tileMapIDClean = Sanitizers.alphaNumDash(tileMapID),
		      path           = `${config.paths.statics}\\tilemaps\\${tileMapIDClean}.json`;

		if (this.cache.tilemaps[tileMapIDClean]) return this.cache.tilemaps[tileMapIDClean];

		const exists = fs.existsSync(path);

		if (!exists) {
			console.error(`Tilemap ${tileMapIDClean} (${path}) does not exist!`);
			return null;
		}

		const contents = await fs.readJson(path, {encoding: 'utf8'});

		if (_.isEmpty(contents)) {
			console.error(`Tilemap ${tileMapIDClean} is empty!`);
			return null;
		}

		const tilemap = new TiledTileMap(tileMapIDClean, contents);

		this.cache.tilemaps[tileMapIDClean] = tilemap;

		return tilemap;
	}

	async findRegionAtCoords(mapID: string, x: number, y: number) {
		const tilemap = await this.getTilemap(mapID);

		if (tilemap && tilemap.regions) {
			return Object.keys(tilemap.regions).find(regionID => {
				const tiles = tilemap.regions[regionID].keyTiles;

				if (tiles && tiles.length) {
					return isPointInPoly(x, y, tiles);
				}

				return false;
			}) || null;
		}

		return null;
	}
}

function isPointInPoly(x: number, y: number, poly: Array<ICoordPair>): boolean {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	const vs = poly.map(coordPair => [coordPair.x, coordPair.y]);

	let inside = false;

	for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		let xi                = vs[i][0], yi = vs[i][1],
		    xj = vs[j][0], yj = vs[j][1];

		let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}

	return inside;
}
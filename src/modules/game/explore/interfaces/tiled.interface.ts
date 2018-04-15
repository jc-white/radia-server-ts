import {Dictionary} from 'lodash';
import {TiledTile, TiledTileMap, TiledTileset} from '../tiled.service';
import {ICoordPair} from './explore.interface';

export interface ITileGrid extends Array<any> {
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
	properties: Dictionary<string>;
	rotation: number;
	gid?: number;
	visible: boolean;
	template?: any;
}

export interface ITiledPolyline extends ITiledObject {
	polyline: Array<ICoordPair>;
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

export interface ITiledRegion {
	regionID: string;
	keyTiles: Array<ICoordPair>;
}

export interface ITileMapCache {
	tilemaps: {
		[tileMapID: string]: TiledTileMap
	},

	tilesets: {
		[tileSetID: string]: TiledTileset
	}
}
import {Component} from '@nestjs/common';
import {Dictionary} from 'lodash';
import {IPartyLocation} from '../../explore/interfaces/explore.interface';
import {TiledService} from '../../explore/tiled.service';
import {Map} from '../models/location/map.model';
import {Region} from '../models/location/region.model';
import {Party} from '../models/party/party.model';

@Component()
export class LocationService {
	cache: {
		maps: Dictionary<Map>,
		regions: Dictionary<Region>,
		regionsByTile: {
			[mapID: string]: {
				[coords: string]: string
			}
		}
	} = {
		maps:          {},
		regions:       {},
		regionsByTile: {}
	};

	constructor(private tiledService: TiledService) {

	}

	async getMap(mapID: string) {
		if (this.cache.maps[mapID]) {
			return this.cache.maps[mapID];
		}

		const map = await Map.findByMapID(mapID);

		if (!map) {
			console.error('Map not found: ' + mapID);
			return null;
		}

		this.cache.maps[map.mapID] = map;

		return map;
	}

	async getRegion(regionID: string | Promise<string>): Promise<Region> {
		regionID = await Promise.resolve(regionID);

		if (this.cache.regions[regionID]) {
			return this.cache.regions[regionID];
		}

		const region = await Region.findByRegionID(regionID);

		if (!region) {
			console.error('Region not found: ' + regionID);
			return null;
		}

		this.cache.regions[region.regionID] = region;

		return region;
	}

	async getMapForRegion(region: Region) {
		return this.getMap(region.mapID);
	}

	async getRegionByTile(mapID: string, x: number, y: number): Promise<Region> {
		if (this.cache.regionsByTile[mapID] && this.cache.regionsByTile[mapID][`${x}${y}`]) {
			console.log('Cached!');
			return this.getRegion(this.cache.regionsByTile[mapID][`${x}${y}`]);
		}

		let region = await this.getRegion(this.tiledService.findRegionInMap(mapID, x, y));

		if (region) {
			if (!this.cache.regionsByTile[mapID]) {
				this.cache.regionsByTile[mapID] = {};
			}

			this.cache.regionsByTile[mapID][`${x}${y}`] = region.regionID;
		} else {
			region = Object.assign(new Region(), {
				regionID:         'wilderness',
				name:             'The Wilderness',
				mapID:            mapID
			});
		}

		return region;
	}

	async getPartyLocation(party: Party): Promise<IPartyLocation> {
		try {
			console.log('Finding party location', party.partyID);

			const getMap    = this.getMap(party.mapID),
			      getRegion = this.getRegionByTile(party.mapID, party.posX, party.posY);

			let [map, region] = await Promise.all([getMap, getRegion]);

			if (!region && map.wilderness) {
				region = await this.getRegion(map.wilderness);
			} else {
				region = Object.assign(new Region(), {
					regionID:         'wilderness',
					name:             'The Wilderness',
					mapID:            map.mapID
				});
			}

			return {
				map:    {
					mapID: map.mapID,
					name:  map.name
				},
				region: {
					regionID: region.regionID,
					name:     region.name
				}
			}
		} catch (error) {
			console.error('Error getting party location', error);
		}
	}
}
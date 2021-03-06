import {OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {Utils} from '../../../shared/functions/utils';
import {WeightedList} from '../../../shared/functions/weighted';
import {
	PacketSendLoadMap,
	PacketSendMoveSuccess, PacketSendRecruitableHeroes,
	PacketSendSpawns, PacketSendTileProps
} from '../../../socket/packets/explore/explore.packets';
import {PacketSendItems, PacketSendSetFatigue} from '../../../socket/packets/parties/parties.packets-send';
import {PlayerSocket} from '../../../socket/player-socket.interface';
import {RootGateway} from '../../../socket/root-gateway.class';
import {PartyResources} from '../common/dicts/resources.dict';
import {HeroTemplate} from '../common/models/hero/hero-template.model';
import {Hero} from '../common/models/hero/hero.model';
import {EPartyCurrentStatus} from '../common/models/party/party.enum';
import {HeroService} from '../common/services/hero.service';
import {ItemService} from '../common/services/item.service';
import {LocationService} from '../common/services/location-service.component';
import {PacketService} from '../common/services/packet.service';
import {GameConfig} from '../config/game.config';
import {PartyService} from '../party/party.service';
import {PlayerService} from '../common/services/player.service';
import {Forage} from './models/misc/forage.model';
import {RecruitGroup} from './models/recruit/recruit-group.model';
import {SpawnGroup} from './models/spawn/spawnGroup.model';
import {SpawnService} from './spawn.service';
import {TiledService} from './tiled.service';
import * as _ from 'lodash';

@WebSocketGateway({
	port:      5050,
	namespace: 'explore'
})
export class ExploreGateway extends RootGateway implements OnGatewayConnection, OnGatewayInit {
	constructor(private playerService: PlayerService, private partyService: PartyService, private tiledService: TiledService, private locService: LocationService, private spawnService: SpawnService,
	            private heroService: HeroService) {
		super(playerService);
	}

	@SubscribeMessage('init')
	async handleMapInit(sender: PlayerSocket, data) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID],
			      party  = await player.getParty();

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			const map    = await this.locService.getMap(party.mapID),
			      region = await this.locService.getRegionByTile(party.mapID, party.posX, party.posY);

			await this.locService.cacheAllTileProperties(party.mapID);

			if (region) {
				//Send region welcome message
				PacketService.sendMessage(player, `You are currently in ${region.name}.`);

				if (region.entryDescription) {
					PacketService.sendMessage(player, region.entryDescription);
				}

				party.setCurrentRegion(region);
			}

			PacketService.sendPacket(player, new PacketSendLoadMap({
				id:      map.mapID,
				tileset: map.tileset
			}));

			//Spawn this region if necessary
			//TODO: Get all spawn groups in this map and spawn those instead of spawnGroupID = 1
			await this.spawnService.evaluateSpawnGroup(await SpawnGroup.getByID(1));

			//Get spawns and send to the client
			const spawns = await this.spawnService.findSpawnsByCoords(map.mapID, party.posX, party.posY);

			PacketService.sendPacket(player, new PacketSendSpawns(spawns.length ? spawns : []));

			//If this tile has properties, send non-hidden props to the client
			const tileProps    = await this.locService.getTileProperties(map.mapID, party.posX, party.posY),
			      visibleProps = this.locService.getVisibleTileProps(tileProps);

			PacketService.sendPacket(player, new PacketSendTileProps(visibleProps));

			if (!_.isEmpty(tileProps)) {
				if (tileProps.enterText) {
					PacketService.sendMessage(player, tileProps.enterText);
				}
			}
		} catch (error) {
			console.log('handleMapInit error', error);
		}
	}

	@SubscribeMessage('move')
	async handleMove(sender: PlayerSocket, data: { x: number, y: number }) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID],
			      party  = await player.getParty();

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			if (party.$currentStatus == EPartyCurrentStatus.CAMPING) {
				PacketService.sendToast(player, `You cannot travel while camping.`);
				return;
			} else if (party.$currentStatus == EPartyCurrentStatus.IN_COMBAT) {
				PacketService.sendToast(player, `You cannot travel while in combat.`);
				return;
			}

			if (party.fatigue >= 100) {
				PacketService.sendMessage(player, 'Your party is too fatigued to travel. You should take a rest.');
				return;
			}

			const map     = await this.locService.getMap(party.mapID),
			      tileset = await this.tiledService.getTilemap(map.mapID);

			let path = await tileset.getPath(party.posX, party.posY, data.x, data.y);

			if (path) {
				//Remove the first entry from the path since it's where the party currently is
				path = path.slice(1);

				//Remove any actions currently queued related to traveling
				player.queue.removeByTag('travel');

				party.setCurrentStatus(EPartyCurrentStatus.TRAVELING);

				for (let i = 0; i < path.length; i++) {
					player.queue.addTask({
						time:  200,
						after: async (job) => {
							if (party.fatigue + 2 > 100) {
								PacketService.sendMessage(player, 'Your party is too fatigued to continue traveling. You should take a rest.');
								player.queue.removeByTag('travel');
								party.setCurrentStatus(EPartyCurrentStatus.IDLE);
							} else {
								const region = await this.locService.getRegionByTile(party.mapID, path[i].x, path[i].y);

								if (region) {
									if (!party.$currentRegion || party.$currentRegion.regionID != region.regionID) {
										//Send region welcome message
										PacketService.sendMessage(player, `You have entered ${region.name}.`);

										if (region.entryDescription) {
											PacketService.sendMessage(player, region.entryDescription);
										}
									}

									party.setCurrentRegion(region);
								}

								//If this tile has properties, send non-hidden props to the client
								const tileProps    = await this.locService.getTileProperties(map.mapID, path[i].x, path[i].y),
								      oldTileProps = await this.locService.getTileProperties(map.mapID, party.posX, party.posY),
								      visibleProps = this.locService.getVisibleTileProps(tileProps);

								PacketService.sendPacket(player, new PacketSendTileProps(visibleProps));

								if (!_.isEmpty(tileProps)) {
									if (tileProps.enterText) {
										PacketService.sendMessage(player, tileProps.enterText);
									}
								}

								if (!_.isEmpty(oldTileProps) && oldTileProps.exitText) {
									PacketService.sendMessage(player, oldTileProps.exitText);
								}

								party.setPos(path[i].x, path[i].y);
								PacketService.sendPacket(player, new PacketSendMoveSuccess([path[i]]));

								party.addFatigue(2);
								PacketService.sendPacket(player, new PacketSendSetFatigue(party.fatigue));
							}
						},
						tags:  ['explore', 'travel']
					});
				}

				player.queue.addTask({
					after: async (job) => {
						await party.save();
						party.setCurrentStatus(EPartyCurrentStatus.IDLE);

						//Get spawns and send to the client
						const spawns = await this.spawnService.findSpawnsByCoords(map.mapID, party.posX, party.posY);

						PacketService.sendPacket(player, new PacketSendSpawns(spawns.length ? spawns : []));
					}
				});

				player.queue.start();
			}
		} catch (error) {
			console.log('Move error', error);
		}
	}

	@SubscribeMessage('camp')
	async handleCamp(sender: PlayerSocket) {
		try {
			if (!sender || !sender.userID) return;

			const player          = this.playerService.players[sender.userID],
			      [party, heroes] = await Promise.all([player.getParty(), player.getHeroes()]);

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			if (party.$currentStatus != EPartyCurrentStatus.IDLE) {
				PacketService.sendToast(player, `You cannot camp right now.`);
				return;
			}

			//const map     = await this.locService.getMap(party.mapID),
			//      tileset = await this.tiledService.getTilemap(map.mapID);

			//Remove any actions currently queued related to traveling (just in case, there should never really be anything in the queue)
			player.queue.removeByTag('travel');

			party.setCurrentStatus(EPartyCurrentStatus.CAMPING);

			PacketService.sendMessage(player, `You begin to set up your campsite.`);
			if (party.hasResource('meals', heroes.length)) {
				player.queue.addTask(() => {
					party.removeResource('meals', heroes.length);
					heroes.forEach(hero => hero.healVitByPct('health', 0.75));

					PacketService.sendMessage(player, `Your entire party is well-fed after consuming a hearty meal.`);
				}, 1000);
			} else if (party.getResource('meals') > 0) {
				player.queue.addTask(() => {
					const mealsToShare = Math.min(party.getResource('meals'), heroes.length),
					      healPct      = (mealsToShare / heroes.length) * 0.75;

					party.removeResource('meals', mealsToShare);

					heroes.forEach(hero => hero.healVitByPct('health', healPct));
					if (mealsToShare == 1) {
						PacketService.sendMessage(player, `Having to share a meal, your party is highly unsatisfied with dinner.`);
					} else {
						PacketService.sendMessage(player, `Having to share ${mealsToShare} meals, your party is slightly unsatisfied with dinner.`);
					}
				}, 1000);
			} else {
				player.queue.addTask(() => {
					PacketService.sendMessage(player, `Your party goes to bed without a meal, starving.`);
				}, 1000);
			}

			//Get the region so we can apply any region-specific effects while camping
			//const region = await this.locService.getRegionByTile(party.mapID, party.posX, party.posY);

			//if (region) {

			//}

			for (let i = 0; i < 5; i++) {
				player.queue.addTask({
					time:  i == 0 ? 1000 : 500,
					after: async (job) => {
						PacketService.sendMessage(player, `... zZzZz ...`);

						party.removeFatigue(10);
						PacketService.sendPacket(player, new PacketSendSetFatigue(party.fatigue));
					},
					tags:  ['explore', 'camp']
				});
			}

			player.queue.addTask({
				time:  1000,
				after: async (job) => {
					await party.save();
					party.setCurrentStatus(EPartyCurrentStatus.IDLE);
					PacketService.sendMessage(player, `Your party awakens feeling well-rested.`);
				}
			});

			player.queue.start();
		} catch (error) {
			console.log('Camp error', error);
		}
	}

	@SubscribeMessage('forage')
	async handleForage(sender: PlayerSocket) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID],
			      party  = await player.getParty();

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			if (party.$currentStatus != EPartyCurrentStatus.IDLE) {
				PacketService.sendToast(player, `You cannot forage right now.`);
				return;
			}

			if (party.fatigue >= 100) {
				PacketService.sendMessage(player, 'Your party is too fatigued to forage. You should take a rest.');
				return;
			}

			//const map     = await this.locService.getMap(party.mapID),
			//      tileset = await this.tiledService.getTilemap(map.mapID);

			//Remove any actions currently queued related to traveling (just in case, there should never really be anything in the queue)
			player.queue.removeByTag('travel');

			party.setCurrentStatus(EPartyCurrentStatus.FORAGING);

			PacketService.sendMessage(player, `You begin to forage around the area.`);

			for (let i = 0; i < 3; i++) {
				player.queue.addTask({
					time:  (i == 0 ? 1000 : 0) + (_.random(i * 500, i * 1500)),
					after: async (job) => {
						if (party.fatigue + 1 > 100) {
							PacketService.sendMessage(player, 'Your party is too fatigued to forage more. You should take a rest.');
							player.queue.removeByTag('forage');
							party.setCurrentStatus(EPartyCurrentStatus.IDLE);
						} else {
							PacketService.sendMessage(player, `<i>rustle rustle</i>`);

							party.addFatigue(1);
							PacketService.sendPacket(player, new PacketSendSetFatigue(party.fatigue));
						}
					},
					tags:  ['explore', 'forage']
				});
			}

			//Get the region so we can apply any region-specific effects while foraging
			const region = await this.locService.getRegionByTile(party.mapID, party.posX, party.posY);

			let entries;

			if (region) {
				entries = await Forage.getByRegionID(party.mapID, region.regionID);
			} else {
				entries = await Forage.getByMapID(party.mapID);
			}

			entries.push({
				message: 'You find nothing in your forage attempt.',
				weight:  80
			});

			const wl     = new WeightedList<Forage>(entries, 'weight'),
			      result = wl.pull();

			player.queue.addTask(async () => {
				if (result.effects) {
					if (result.effects.resources) {
						const resources = result.effects.resources;

						Object.keys(resources).forEach((resourceType: PartyResources) => {
							result.message += ` 🡺 +${resources[resourceType]} ${resourceType}`;

							party.addResource(resourceType, resources[resourceType]);
						});
					}

					if (result.effects.fatigue) {
						const fatigue = result.effects.fatigue;

						result.message += ` 🡺 ${fatigue > 0 ? '+' : '-'}${fatigue} party fatigue`;

						party.addFatigue(fatigue);
					}
				}

				PacketService.sendMessage(player, result.message);
			}, 1000, ['explore', 'forage']);

			player.queue.addTask(async () => {
				await party.save();
				party.setCurrentStatus(EPartyCurrentStatus.IDLE);
			});

			player.queue.start();
		} catch (error) {
			console.log('Camp error', error);
		}
	}

	@SubscribeMessage('getRecruitableHeroes')
	async getRecruitableHeroes(sender: PlayerSocket) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID],
			      party  = await player.getParty();

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			if (party.$currentStatus != EPartyCurrentStatus.IDLE) {
				PacketService.sendToast(player, `You cannot do that right now.`);
				return;
			}

			const map             = await this.locService.getMap(party.mapID),
			      tileProps       = await this.locService.getTileProperties(map.mapID, party.posX, party.posY),
			      currentHeroes   = this.locService.getTileInstanceProp(map.mapID, party.posX, party.posY, 'recruitableHeroes'),
			      lastRefreshTime = this.locService.getTileInstanceProp(map.mapID, party.posX, party.posY, 'lastRecruitRefresh');

			if (!tileProps.hasOwnProperty('maxRecruits')) {
				console.log('Tried to request hero recruit refresh on tile with no maxRecruits defined:', map.mapID, party.posX, party.posY);
				return;
			}

			let heroesAvailable: Array<Hero> = [];

			if (Array.isArray(currentHeroes)) heroesAvailable = heroesAvailable.concat(currentHeroes);

			const shouldRefresh = ((lastRefreshTime || 0) + GameConfig.heroRecruitment.defaultRefreshTime) < (new Date()).getTime();

			if (shouldRefresh && Array.isArray(tileProps.recruitGroups)) {
				//Generate new heroes for this tile
				const groups = await RecruitGroup.query().whereIn('recruitGroupID', tileProps.recruitGroups),
				      wl     = new WeightedList([]);

				groups.forEach(group => {
					Object.keys(group.heroTemplates).forEach(heroTemplateID => {
						wl.add({
							heroTemplateID: heroTemplateID,
							weight:         group.heroTemplates[heroTemplateID]
						});
					});
				});

				for (let x = 0; x < tileProps.maxRecruits; x++) {
					const pulledEntry = wl.pull(),
					      newHero     = await this.heroService.generateHero(pulledEntry.heroTemplateID);

					heroesAvailable.push(newHero);
				}

				//Set the instance property
				this.locService.setTileInstanceProp(map.mapID, party.posX, party.posY, 'recruitableHeroes', heroesAvailable);
				this.locService.setTileInstanceProp(map.mapID, party.posX, party.posY, 'lastRecruitRefresh', (new Date()).getTime());
			}

			const itemIDs = [];
			//Send items belonging to these heroes to the player
			heroesAvailable.forEach(hero => {
				itemIDs.push(...Object.values(hero.equipment));
			});

			console.log('ItemIDs to find', itemIDs);
			const itemPack = new PacketSendItems(await ItemService.getItems(itemIDs));

			console.log(itemPack);

			PacketService.sendPacket(player, itemPack);

			//Send packet of heroes available for recruitment to the player
			PacketService.sendPacket(player, new PacketSendRecruitableHeroes(heroesAvailable));
		} catch (error) {
			console.log('GetRecruitableHeroes error', error);
		}
	}
}
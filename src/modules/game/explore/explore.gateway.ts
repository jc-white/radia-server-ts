import {OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {PacketLoadMap} from '../../../socket/packets/explore/explore.packets';
import {PlayerSocket} from '../../../socket/player-socket.interface';
import {RootGateway} from '../../../socket/root-gateway.class';
import {DBService} from '../../db/db.service';
import {Party} from '../common/models/party/party.model';
import {PacketService} from '../common/services/packet.service';
import {PartyService} from '../common/services/party.service';
import {PlayerService} from '../common/services/player.service';
import {Map} from './models/map.model';
import {TiledService} from './tiled.service';

@WebSocketGateway({
	port:      5050,
	namespace: 'explore'
})
export class ExploreGateway extends RootGateway implements OnGatewayConnection, OnGatewayInit {
	constructor(private playerService: PlayerService, private partyService: PartyService, private tiledService: TiledService, private dbService: DBService) {
		super();
	}

	handleConnection(client: PlayerSocket) {
		client.userID = client.handshake.session.passport.user;

		this.playerService.addPlayer(client.userID, client);
	}

	@SubscribeMessage('init')
	async handleMapInit(sender: PlayerSocket, data) {
		try {
			if (!sender || !sender.userID) return;

			const player = this.playerService.players[sender.userID],
			      party  = await Party.getByUserID(sender.userID);

			if (!party.mapID) {
				console.error('Party does not have a map set', party.partyID);
			}

			const map = await Map.query().findOne('mapID', party.mapID);

			PacketService.sendPacket(player, new PacketLoadMap({
				id:      map.mapID,
				tileset: map.tileset
			}));
		} catch (error) {
			console.log('handleMapInit error', error);
		}
	}
}
import Ticket from '../models/Ticket';
import TicketFacut from '../models/TicketFacut';
import jucator from '../helpers/players';

mp.events.addCommand('ticket', (player: PlayerMp) => {
    const logicPlayer = jucator.get(player.id);
    if (!logicPlayer || !logicPlayer.dbId) return;

    Ticket.findOne({ creator: logicPlayer.dbId }).then(existing => {
        if (existing) {
            player.call('AnuntNotification2', ['Ai deja un ticket activ!', 'rosu']);
            return;
        }

        player.call('Tickets-ShowMenu');
    }).catch(err => {
        console.error('[TICKET-FIND-ERROR]', err);
    });
});

mp.events.subscribe({
    'Tickets-Create': async (player: Player, type: string, title: string, message: string) => {
        if (!player || !player.dbId) return;

        try {
            const existing = await Ticket.findOne({ creator: player.dbId });
            if (existing) {
                player.mp.call('AnuntNotification2', ['Ai deja un ticket activ!', 'rosu']);
                return;
            }

            await Ticket.create({
                creator: player.dbId,
                playerNumericId: player.fixId,
                title: title,
                type: type,
                message: message
            });

            console.log(`[DEBUG] Tickts-Create successful for ${player.dbId}`);
            player.mp.call('AnuntNotification2', ['Ticketul a fost trimis!', 'verde']);
        } catch (err) {
            console.error('[TICKET-CREATE-ERROR]', err);
            player.mp.call('AnuntNotification2', ['A aparut o eroare la trimiterea ticket-ului.', 'rosu']);
        }
    },

    'Tickets-GetActive': async (player: Player) => {
        if (!player || !player.dbId) return [];
        
        try {
            const tickets = await Ticket.find({ status: 'OPEN' }).populate('creator', 'firstName lastName adminJail jailCheckpoints');
            return tickets.map(t => {
                const creator = t.creator as any;
                const playerName = creator ? `${creator.firstName}_${creator.lastName}` : 'Necunoscut';
                
                const onlinePlayer = mp.players.toCustomArray().find(p => p.dbId === t.creator._id.toString());
                const isJailed = onlinePlayer ? onlinePlayer.mp.getVariable('isJailed') : (creator?.adminJail || false);
                const checkpoints = onlinePlayer ? onlinePlayer.mp.getVariable('jailCheckpoints') : (creator?.jailCheckpoints || 0);

                return {
                    id: t._id.toString(),
                    playerId: t.playerNumericId,
                    player: playerName,
                    category: t.type,
                    title: t.title,
                    message: t.message,
                    isVip: false,
                    status: t.status,
                    createdAt: t.createdAt,
                    adminJail: isJailed,
                    jailCheckpoints: checkpoints
                };
            });
        } catch (err) {
            return [];
        }
    },

    'Tickets-Claim': async (admin: Player, ticketId: string) => {
        if (!admin || !admin.dbId) return;

        try {
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) {
                admin.mp.call('AnuntNotification2', ['Ticketul a fost deja preluat', 'rosu']);
                return;
            }

            if (ticket.status !== 'OPEN') {
                admin.mp.call('AnuntNotification2', ['Ticketul a fost deja preluat', 'rosu']);
                return;
            }

            // Create completed ticket in 'ticketefacute'
            await TicketFacut.create({
                creator: ticket.creator,
                playerNumericId: ticket.playerNumericId,
                title: ticket.title,
                type: ticket.type,
                message: ticket.message,
                status: 'CLAIMED',
                claimedBy: {
                    dbId: admin.dbId,
                    numericId: admin.fixId,
                    name: admin.getName(),
                    email: admin.mp.getVariable('email') || ''
                },
                createdAt: ticket.createdAt
            });

            // Delete from active tickets
            await Ticket.findByIdAndDelete(ticketId);

            admin.mp.call('AnuntNotification2', ['Ai preluat ticketul.', 'verde']);

            // Teleport admin to player
            const target = mp.players.toArray().find(p => jucator.get(p.id)?.dbId?.toString() === ticket.creator.toString());
            if (target) {
                admin.mp.position = { x: target.position.x, y: target.position.y, z: target.position.z } as any;
                admin.mp.dimension = target.dimension;
                
                target.call('AnuntNotification2', [`Adminul ${admin.getName()} (${admin.fixId}) ti-a preluat ticketul!`, 'galben']);
            }

            return true;
        } catch (err) {
            console.error('[TICKET-CLAIM]', err);
            admin.mp.call('AnuntNotification2', ['Eroare la preluarea ticketului.', 'rosu']);
            return false;
        }
    },

    'Tickets-Delete': async (admin: Player, ticketId: string) => {
        if (!admin || !admin.dbId) return false;
        try {
            await Ticket.findByIdAndDelete(ticketId);
            admin.mp.call('AnuntNotification2', ['Ticketul a fost sters.', 'verde']);
            return true;
        } catch (err) {
            console.error('[TICKET-DELETE]', err);
            admin.mp.call('AnuntNotification2', ['Eroare la stergere.', 'rosu']);
            return false;
        }
    }
});

mp.events.add('playerQuit', async (playerMp: PlayerMp) => {
    const player = jucator.get(playerMp.id);
    if (!player || !player.dbId) return;

    try {
        await Ticket.deleteOne({ creator: player.dbId, status: 'OPEN' });
    } catch (err) {
        console.error('[TICKET-DELETE-ERROR]', err);
    }
});

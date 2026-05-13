import { remove } from 'lodash';
import points from 'helpers/points';

class FactionPoints {
	private points: Point[] = [];

	add(point: Point, players?: PlayerMp[]) {
		this.points.push(point);
		if (players) {
			players.forEach(p => point.showFor(p));
		}
	}

	remove(point: Point) {
		remove(this.points, (item) => item.id === point.id);
		points.delete(point);
	}

	showFor(player: PlayerMp) {
		this.points.forEach((point) => point.showFor(player));
	}

	hideFor(player: PlayerMp) {
		this.points.forEach((point) => point.hideFor(player));
	}

	clear() {
		this.points.forEach((point) => points.delete(point));
		this.points = [];
	}
}

export default FactionPoints;

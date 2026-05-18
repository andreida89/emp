import browser from 'helpers/browser';
import rpc from 'utils/rpc';

class DMV {
	constructor() {
		rpc.register({
			'DMV-ShowMenu': this.show.bind(this),
			'DMV-StartExam': this.startExam.bind(this),
			'DMV-FinishExam': this.finishExam.bind(this),
			'DMV-Close': this.stop.bind(this)
		});
	}

	show() {
		mp.gui.cursor.show(true, true);
		mp.gui.chat.show(false);
		mp.game.ui.displayRadar(false);
		browser.browser.execute('window.OpenDMVExam()');
	}

	stop() {
		mp.gui.cursor.show(false, false);
		mp.gui.cursor.visible = false;
		mp.gui.chat.show(true);
		mp.game.ui.displayRadar(true);
		mp.browsers.hidePage();
	}

	private async startExam(paymentType: string) {
		const success = await mp.events.callServer('DMV-StartExamRequest', paymentType);
		return success;
	}

	private finishExam(passed: boolean) {
		mp.events.callServer('DMV-FinishExamResult', passed);
	}
}

export default new DMV();

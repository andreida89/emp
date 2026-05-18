import rpc from 'rage-rpc';

class RPC {
	register(name: string | { [key: string]: (...args: any[]) => any }, callback?: (...args: any[]) => any) {
		if (typeof name === 'object') {
			for (const key in name) {
				rpc.register(key, name[key]);
			}
		} else if (callback) {
			rpc.register(name, callback);
		}
	}

	unregister(name: string) {
		rpc.unregister(name);
	}

	async callServer(name: string, args?: any) {
		return rpc.callServer(name, args);
	}

	async callClient(player: PlayerMp, name: string, args?: any) {
		return rpc.callClient(player, name, args);
	}

	async callBrowser(browser: BrowserMp, name: string, args?: any) {
		return rpc.callBrowser(browser, name, args);
	}

	executeBrowser(browser: BrowserMp, code: string) {
		if (browser && (browser as any).execute) {
			(browser as any).execute(code);
		}
	}
}

export default new RPC();

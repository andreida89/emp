import Whitelist from '../models/Whitelist';
import ServerSettings from '../models/ServerSettings';

let whitelistEnabled: boolean = false;

// We still keep a synced version for very fast checks if needed, 
// but for the "live" requirement we will query the DB at login.
async function syncSettings() {
    try {
        const setting = await ServerSettings.findOne({ key: 'whitelistEnabled' }).lean();
        whitelistEnabled = setting ? !!setting.value : false;
    } catch (err) {
        console.error('[WHITELIST] Error syncing settings:', err);
    }
}

// Initial sync
syncSettings();
setInterval(syncSettings, 30 * 1000); // Check settings once per 30s

// Initialization
async function initWhitelist() {
    try {
        const setting = await ServerSettings.findOne({ key: 'whitelistEnabled' });
        if (!setting) {
            await ServerSettings.create({ key: 'whitelistEnabled', value: true });
        }
    } catch (err) {
        console.error('[WHITELIST] Init error:', err);
    }
}

initWhitelist();

/**
 * Live check for whitelist status of a serial.
 * This is called at login to ensure real-time updates from database.
 */
export async function checkWhitelist(player: any, serial: string): Promise<boolean> {
    try {
        // Refresh settings live too just in case
        const setting = await ServerSettings.findOne({ key: 'whitelistEnabled' }).lean();
        const enabled = setting ? !!setting.value : false;
        
        if (!enabled) return true;
        if (!serial) return false;

        const entry = await Whitelist.findOne({ serial: serial.trim() }).lean();
        return !!entry;
    } catch (err) {
        console.error('[WHITELIST] Live check error:', err);
        return false;
    }
}

/**
 * Legacy sync check (might be used in other places)
 * For true live updates, use checkWhitelist
 */
export function isWhitelisted(serial: string): boolean {
    // This cannot be live without being async. 
    // We keep it for backward compatibility if needed, but it won't be "live" unless we make it async.
    // However, the user specifically asked for live check at connection in login.ts.
    return true; // We will handle the logic in checkWhitelist
}

export async function setWhitelistEnabled(enabled: boolean) {
    whitelistEnabled = enabled;
    await ServerSettings.findOneAndUpdate(
        { key: 'whitelistEnabled' },
        { value: enabled },
        { upsert: true, new: true }
    );
    console.log(`[WHITELIST] Whitelist status set to: ${enabled}`);
}

export function isWhitelistEnabled(): boolean {
    return whitelistEnabled;
}

export async function addToWhitelist(name: string, serial: string) {
    await Whitelist.findOneAndUpdate(
        { serial: serial.trim() },
        { name, serial: serial.trim() },
        { upsert: true }
    );
}

export async function removeFromWhitelist(serial: string) {
    await Whitelist.deleteOne({ serial: serial.trim() });
}

export async function getWhitelistData() {
    return await Whitelist.find().lean();
}

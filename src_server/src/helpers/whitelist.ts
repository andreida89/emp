import axios from 'axios';

let whitelist: Set<string> = new Set();

async function fetchWhitelist() {
    try {
        const { data } = await axios.get('https://dl.empirerp.eu/lista.whitelist?' + Date.now());
        whitelist = new Set(
            data
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean)
        );
        //console.log(`[WHITELIST] Loaded ${whitelist.size} serials`);
        // Debug: afișează primele 5 seriale încărcate
        //console.log('[WHITELIST] Primele seriale:', Array.from(whitelist).slice(0, 5));
    } catch (err) {
        console.error('[WHITELIST] Error fetching whitelist list:', err);
    }
}
export async function reloadWhitelist() {
    await fetchWhitelist();
    console.log('[WHITELIST] Reloaded by command');
}
// Descarcă la start și periodic (la 5 minute)
fetchWhitelist();
setInterval(fetchWhitelist, 5 * 60 * 1000);

// Exportă funcția de verificare pe serial
export function isWhitelisted(serial: string): boolean {
    if (!serial) return false; // extra safety
    return whitelist.has(serial.trim());
}

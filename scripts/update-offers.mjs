import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const offersPath = join(__dirname, '..', 'data', 'offers.json');

const raw = readFileSync(offersPath, 'utf-8');
const data = JSON.parse(raw);

const now = new Date();
const active = data.opportunities.filter(o => new Date(o.deadline) > now);

const removed = data.opportunities.length - active.length;

data.opportunities = active;
data.lastRefreshed = now.toISOString();
data.nextRefresh = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
data.totalOpportunities = active.length;

writeFileSync(offersPath, JSON.stringify(data, null, 2) + '\n');

console.log(`[${now.toISOString()}] Refreshed: ${active.length} active, ${removed} expired`);

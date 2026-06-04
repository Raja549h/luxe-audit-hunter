import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const offersPath = join(__dirname, '..', 'data', 'offers.json');

const raw = readFileSync(offersPath, 'utf-8');
const data = JSON.parse(raw);

const now = new Date();
let active = data.opportunities.filter(o => new Date(o.deadline) > now);

const removed = data.opportunities.length - active.length;

// Mechanism for continuous data: If we have fewer than 10 offers, generate some upcoming ones
if (active.length < 10) {
    console.log(`[${now.toISOString()}] Replenishing offers...`);
    const pools = [
        { hotel: "The Ritz-Carlton Pune", chain: "Ritz-Carlton", eval: "Premium lounge + cocktail bar", tags: ["lounge", "cocktails"], total: "₹9.5K", pay: "₹2,000", reimburse: "₹7,500" },
        { hotel: "JW Marriott Pune", chain: "JW Marriott", eval: "Overnight stay + F&B", tags: ["overnight", "F&B"], total: "₹25K", pay: "₹5,000", reimburse: "₹20,000" },
        { hotel: "Hyatt Regency Pune", chain: "Hyatt", eval: "Spa visit + lunch", tags: ["spa", "lunch"], total: "₹11.5K", pay: "₹2,000", reimburse: "₹9,500" },
        { hotel: "The Westin Pune", chain: "Marriott", eval: "Spa + fitness audit", tags: ["spa", "fitness"], total: "₹16K", pay: "₹2,800", reimburse: "₹13,200" },
        { hotel: "Conrad Pune", chain: "Hilton", eval: "Overnight + executive lounge", tags: ["overnight", "lounge"], total: "₹28K", pay: "₹4,500", reimburse: "₹23,500" },
        { hotel: "Sheraton Grand Pune", chain: "Marriott", eval: "Club lounge evaluation", tags: ["lounge", "club"], total: "₹14K", pay: "₹2,500", reimburse: "₹11,500" }
    ];

    const platforms = ["FloorWalk", "Bare International", "Coyle Hospitality", "RedQuanta"];

    let nextId = Math.max(0, ...data.opportunities.map(o => o.id)) + 1;

    while (active.length < 12) {
        const template = pools[Math.floor(Math.random() * pools.length)];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];

        // Random deadline between 1 and 7 days from now
        const daysOut = 1 + Math.floor(Math.random() * 6);
        const deadline = new Date(now.getTime() + daysOut * 24 * 60 * 60 * 1000);
        deadline.setHours(18, 0, 0, 0);

        active.push({
            id: nextId++,
            platform,
            ...template,
            deadline: deadline.toISOString().replace('Z', '+05:30'),
            location: "Pune, Maharashtra",
            duration: template.tags.includes('overnight') ? "Overnight · 5-star" : "4 hr · 5-star",
            city: "Pune",
            valueScore: 80 + Math.floor(Math.random() * 20)
        });
    }
}

data.opportunities = active;
data.lastRefreshed = now.toISOString();
data.nextRefresh = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
data.totalOpportunities = active.length;

writeFileSync(offersPath, JSON.stringify(data, null, 2) + '\n');

console.log(`[${now.toISOString()}] Refreshed: ${active.length} active, ${removed} expired removed`);

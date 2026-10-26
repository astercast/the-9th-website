import {altaz} from '../assets/js/starsky.js';import fs from 'fs';
const ref=JSON.parse(fs.readFileSync(new URL('./ref.json',import.meta.url)));let worst=0;
for(const [ra,de,m,alt,az,pa,pd] of ref){const r=altaz([ra,de,m,0,pa,pd],new Date('2026-10-24T06:00:00Z'),34.05,-118.24);const da=Math.abs(r.alt-alt),dz=Math.abs(((r.az-az+540)%360)-180);worst=Math.max(worst,da);console.log(m,alt.toFixed(2),r.alt.toFixed(2),'dAlt',da.toFixed(3),'dAz',dz.toFixed(3))}
console.log('worst alt error deg',worst.toFixed(3));

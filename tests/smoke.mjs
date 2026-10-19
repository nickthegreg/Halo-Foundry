// Boots the game in headless Chromium, lets it run, and fails on any page error.
// Run: npm test   (set CHROME_PATH if Chromium isn't found automatically)
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { serve } from './serve.mjs';

const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const executablePath = candidates.find(p => p && existsSync(p));
if (!executablePath) { console.error('No Chromium found. Set CHROME_PATH.'); process.exit(1); }

const server = await serve(4179);
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('http://localhost:4179/');
await page.waitForTimeout(2500);
const goal = await page.textContent('#goalName');
const tools = await page.$$eval('#tools .tool', els => els.length);
await browser.close();
server.close();

const fail = [];
if (errors.length) fail.push('page errors:\n  ' + errors.join('\n  '));
if (!goal) fail.push('milestone name never rendered');
if (tools < 10) fail.push(`only ${tools} tools in the dock`);
if (fail.length) { console.error('Smoke test FAILED\n' + fail.join('\n')); process.exit(1); }
console.log(`Smoke test passed: "${goal}", ${tools} tools, no page errors.`);

import { spawn } from 'child_process';
import fs from 'fs';

async function captureShopRatesScreen() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\f095a0aa-9955-455a-a801-d46f76dae92e\\scratch\\chrome_profile_rates';

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=430,932',
    'http://localhost:3000/admin/#shop-rates'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9225/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');

    if (pageTab && pageTab.webSocketDebuggerUrl) {
      const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
      await new Promise(res => ws.addEventListener('open', res));

      let msgId = 1;
      function send(method, params = {}) {
        return new Promise((resolve) => {
          const id = msgId++;
          const handler = (evt) => {
            const parsed = JSON.parse(evt.data.toString());
            if (parsed.id === id) {
              ws.removeEventListener('message', handler);
              resolve(parsed.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      await send('Runtime.enable');
      await send('Page.enable');

      // Wait 3 seconds for shop rates fetch and table rendering
      await new Promise(r => setTimeout(r, 3000));

      const evalRes = await send('Runtime.evaluate', {
        expression: `({
          title: document.querySelector('.shop-rates-title')?.textContent,
          rows: document.querySelectorAll('#shop-rates-tbody tr').length,
          firstRowMetal: document.querySelector('.rate-cell-metal')?.textContent,
          firstRowPurity: document.querySelector('.rate-cell-purity')?.textContent,
          firstRowRate: document.querySelector('.rate-cell-rate')?.textContent,
          firstRowMaking: document.querySelector('.rate-cell-making')?.textContent,
          syncText: document.getElementById('shop-rates-sync-text')?.textContent,
          lastUpdated: document.getElementById('shop-rates-last-updated')?.textContent
        })`,
        returnByValue: true
      });

      console.log('DOM Evaluation:', JSON.stringify(evalRes.result.value, null, 2));

      const shotRes = await send('Page.captureScreenshot', { format: 'png' });
      if (shotRes?.data) {
        const dest = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\f095a0aa-9955-455a-a801-d46f76dae92e\\scratch\\final_shop_rates_mobile.png';
        fs.writeFileSync(dest, Buffer.from(shotRes.data, 'base64'));
        console.log('Screenshot saved successfully to:', dest);
      }

      ws.close();
    }
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    chrome.kill();
  }
}

captureShopRatesScreen().catch(console.error);

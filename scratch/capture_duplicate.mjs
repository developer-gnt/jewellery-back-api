import { spawn } from 'child_process';
import fs from 'fs';

async function captureDuplicateBanner() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\f095a0aa-9955-455a-a801-d46f76dae92e\\scratch\\chrome_profile_dup';

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=430,932',
    'http://localhost:3000/admin/#shop-rates'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9228/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
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
    await new Promise(r => setTimeout(r, 2500));

    // Open add modal and select Gold 24K
    await send('Runtime.evaluate', {
      expression: `(async () => {
        document.querySelector('.btn-add-shop-rate')?.click();
        await new Promise(r => setTimeout(r, 300));
        const metalSelect = document.getElementById('add-shoprate-metal');
        metalSelect.value = 'gold';
        metalSelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 300));
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '24K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 500));
      })()`,
      awaitPromise: true
    });

    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    if (shotRes?.data) {
      const dest = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\58f9c7fc-54ed-448b-b464-61b2d7e804c0\\scratch\\duplicate_rate_screenshot.png';
      fs.writeFileSync(dest, Buffer.from(shotRes.data, 'base64'));
      console.log('Duplicate screenshot saved to:', dest);
    }

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}

captureDuplicateBanner().catch(console.error);

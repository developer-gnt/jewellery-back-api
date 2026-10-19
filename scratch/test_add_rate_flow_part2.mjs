import { spawn } from 'child_process';
import fs from 'fs';

async function runPart2() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\f095a0aa-9955-455a-a801-d46f76dae92e\\scratch\\chrome_profile_add_test2';

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=430,932',
    'http://localhost:3000/admin/#shop-rates'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9227/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');

    if (!pageTab || !pageTab.webSocketDebuggerUrl) {
      throw new Error('Chrome page tab not found');
    }

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

    console.log('--- TEST STEP 6: Duplicate detection for recently added Gold 14K ---');
    const step6 = await send('Runtime.evaluate', {
      expression: `(async () => {
        document.querySelector('.btn-add-shop-rate')?.click();
        await new Promise(r => setTimeout(r, 400));
        const metalSelect = document.getElementById('add-shoprate-metal');
        metalSelect.value = 'gold';
        metalSelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 400));
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '14K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));

        const banner = document.getElementById('add-shoprate-duplicate-banner');
        const isBannerVisible = banner && !banner.classList.contains('hidden');
        const text = document.getElementById('add-shoprate-duplicate-text')?.textContent;
        const disabled = document.getElementById('btn-submit-add-shoprate')?.disabled;

        return { isBannerVisible, text, disabled };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 6 Result:', step6.result.value);

    console.log('--- TEST STEP 7: Switch to Edit workflow from duplicate banner ---');
    const step7 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const editBtn = document.getElementById('btn-add-shoprate-goto-edit');
        if (!editBtn) return { error: 'Edit button not found' };
        editBtn.click();
        await new Promise(r => setTimeout(r, 500));
        const addModalHidden = document.getElementById('modal-add-shop-rate')?.classList.contains('hidden');
        const editModalVisible = !document.getElementById('modal-edit-shop-rate')?.classList.contains('hidden');
        const editPurity = document.getElementById('edit-shoprate-purity')?.value;
        const editMaking = document.getElementById('edit-shoprate-making')?.value;

        // Close edit modal
        document.getElementById('modal-edit-shop-rate')?.classList.add('hidden');
        return { addModalHidden, editModalVisible, editPurity, editMaking };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 7 Result:', step7.result.value);

    console.log('--- TEST STEP 8: Cancel modal without unsaved changes (closes immediately) ---');
    const step8 = await send('Runtime.evaluate', {
      expression: `(async () => {
        document.querySelector('.btn-add-shop-rate')?.click();
        await new Promise(r => setTimeout(r, 400));
        const modalBefore = !document.getElementById('modal-add-shop-rate')?.classList.contains('hidden');

        // Click cancel without making changes
        const cancelBtn = document.querySelector('#modal-add-shop-rate .btn-cust-cancel');
        cancelBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const modalAfter = document.getElementById('modal-add-shop-rate')?.classList.contains('hidden');
        return { modalBefore, modalAfterClosed: modalAfter };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 8 Result:', step8.result.value);

    console.log('--- TEST STEP 9: Visual Capture of Add Store Retail Rate Modal ---');
    await send('Runtime.evaluate', {
      expression: `(async () => {
        document.querySelector('.btn-add-shop-rate')?.click();
        await new Promise(r => setTimeout(r, 400));
        const metalSelect = document.getElementById('add-shoprate-metal');
        metalSelect.value = 'gold';
        metalSelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 400));
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '10K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));
      })()`,
      awaitPromise: true
    });

    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    if (shotRes?.data) {
      const dest = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\58f9c7fc-54ed-448b-b464-61b2d7e804c0\\scratch\\add_store_retail_rate_screenshot.png';
      fs.writeFileSync(dest, Buffer.from(shotRes.data, 'base64'));
      console.log('Screenshot saved to:', dest);
    }

    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    chrome.kill();
  }
}

runPart2().catch(console.error);

import { spawn } from 'child_process';

async function runTest() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\f095a0aa-9955-455a-a801-d46f76dae92e\\scratch\\chrome_profile_add_test';

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,900',
    'http://localhost:3000/admin/#shop-rates'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9226/json');
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

    // Wait 3s for admin page load and shop rates fetch
    await new Promise(r => setTimeout(r, 3000));

    console.log('--- TEST STEP 1: Verify Shop Rates Page & Click Add Rate ---');
    const step1 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const addBtn = document.querySelector('.btn-add-shop-rate');
        if (!addBtn) return { error: 'Add rate button not found' };
        addBtn.click();
        await new Promise(r => setTimeout(r, 600));
        const modal = document.getElementById('modal-add-shop-rate');
        const isVisible = modal && !modal.classList.contains('hidden');
        const metal = document.getElementById('add-shoprate-metal')?.value;
        const purity = document.getElementById('add-shoprate-purity')?.value;
        const rate = document.getElementById('add-shoprate-rate')?.value;
        const isReadonly = document.getElementById('add-shoprate-rate')?.readOnly;
        return { isVisible, metal, purity, rate, isReadonly };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 1 Result:', step1.result.value);

    console.log('--- TEST STEP 2: Change Purity and Verify Automatic Rate Update ---');
    const step2 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '18K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));
        const rate18K = document.getElementById('add-shoprate-rate')?.value;
        const freshness = document.getElementById('add-shoprate-freshness-info')?.textContent;
        return { purity: '18K', rate: rate18K, freshness };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 2 Result:', step2.result.value);

    console.log('--- TEST STEP 3: Change Metal to Silver & Verify Purity Options Reset ---');
    const step3 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const metalSelect = document.getElementById('add-shoprate-metal');
        metalSelect.value = 'silver';
        metalSelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));
        const puritySelect = document.getElementById('add-shoprate-purity');
        const purities = Array.from(puritySelect.options).map(o => o.value);
        const selectedPurity = puritySelect.value;
        const rateSilver = document.getElementById('add-shoprate-rate')?.value;
        return { metal: 'silver', purities, selectedPurity, rate: rateSilver };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 3 Result:', step3.result.value);

    console.log('--- TEST STEP 4: Test Duplicate Detection (Gold 24K) ---');
    const step4 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const metalSelect = document.getElementById('add-shoprate-metal');
        metalSelect.value = 'gold';
        metalSelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 400));
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '24K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));

        const duplicateBanner = document.getElementById('add-shoprate-duplicate-banner');
        const bannerVisible = duplicateBanner && !duplicateBanner.classList.contains('hidden');
        const bannerText = document.getElementById('add-shoprate-duplicate-text')?.textContent;
        const submitBtnDisabled = document.getElementById('btn-submit-add-shoprate')?.disabled;
        return { bannerVisible, bannerText, submitBtnDisabled };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 4 Result:', step4.result.value);

    console.log('--- TEST STEP 5: Select Unconfigured Purity (Gold 14K), Fill Inputs, Submit ---');
    const step5 = await send('Runtime.evaluate', {
      expression: `(async () => {
        const puritySelect = document.getElementById('add-shoprate-purity');
        puritySelect.value = '14K';
        puritySelect.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 600));

        const bannerVisible = !document.getElementById('add-shoprate-duplicate-banner')?.classList.contains('hidden');
        const submitBtnDisabled = document.getElementById('btn-submit-add-shoprate')?.disabled;

        const makingInput = document.getElementById('add-shoprate-making');
        makingInput.value = '420.00';
        makingInput.dispatchEvent(new Event('input'));

        const notesInput = document.getElementById('add-shoprate-notes');
        notesInput.value = '585 Everyday Gold Spec';
        notesInput.dispatchEvent(new Event('input'));

        const form = document.getElementById('form-add-shop-rate');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

        // Wait for save and table reload
        await new Promise(r => setTimeout(r, 2000));

        const modalHidden = document.getElementById('modal-add-shop-rate')?.classList.contains('hidden');
        const rows = Array.from(document.querySelectorAll('#shop-rates-tbody tr')).map(tr => ({
          metal: tr.querySelector('.rate-cell-metal')?.textContent?.trim(),
          purity: tr.querySelector('.rate-cell-purity')?.textContent?.trim(),
          rate: tr.querySelector('.rate-cell-rate')?.textContent?.trim(),
          making: tr.querySelector('.rate-cell-making')?.textContent?.trim()
        }));

        return { bannerVisible, submitBtnDisabled, modalHidden, rowsCount: rows.length, rows };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Step 5 Result:', JSON.stringify(step5.result.value, null, 2));

    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    chrome.kill();
  }
}

runTest().catch(console.error);

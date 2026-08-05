const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));
  
  page.on('dialog', async dialog => {
    console.log('DIALOG:', dialog.message());
    await dialog.accept();
  });

  // Set Basic Auth
  await page.authenticate({ username: 'admin', password: 'DambullaTigerRock2026' });
  
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle2' });
  
  // Click Rooms tab
  await page.click('[data-tab="rooms"]');
  // Wait for 1s instead of waitForTimeout
  await new Promise(r => setTimeout(r, 1000));
  
  // Try to click delete on a room
  const deleteBtn = await page.$('.delete-room');
  if (deleteBtn) {
    console.log('Found delete room button, clicking it...');
    await deleteBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Finished waiting after delete.');
  } else {
    console.log('No delete button found.');
  }

  await browser.close();
})();

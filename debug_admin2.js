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

  await page.authenticate({ username: 'admin', password: 'DambullaTigerRock2026' });
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle2' });
  
  await page.click('[data-tab="rooms"]');
  await new Promise(r => setTimeout(r, 1000));
  
  const editBtn = await page.$('.edit-room');
  if (editBtn) {
    console.log('Found edit room button, clicking it...');
    await editBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Try to save the room
    const saveBtn = await page.$('button[type="submit"]');
    if (saveBtn) {
      console.log('Found save button, clicking it...');
      await saveBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('Finished saving.');
    } else {
      console.log('No save button found.');
    }
  } else {
    console.log('No edit button found.');
  }

  await browser.close();
})();

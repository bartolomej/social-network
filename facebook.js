const puppeteer = require('puppeteer');
const {autoScroll} = require('./utils');
const $ = require('cheerio');

module.exports.scrapeProfileHtml = async (username, password, user) => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://www.facebook.com/login/');
  await page.waitForSelector('[name=email]', {visible: true});

  await page.type('[name=email]', username);
  await page.type('[name=pass]', password);

  await page.click('[type=submit]');
  //await page.waitForSelector('#mainContainer', {visible: true});
  await page.waitFor(3000);
  await page.goto(`https://www.facebook.com/${user}`);
  await page.waitForSelector('#u_0_1y', {visible: true});

  await page.screenshot({path: `${user}.png`});

  const details = await page.evaluate(() => {
    const details = document.getElementsByClassName('textContent');
    return Array.from(details).map(ele => ele.innerHTML);
  });

  await page.evaluate(() => {
    document.getElementsByClassName('_6-6')[2].click()
  });
  await page.waitFor(1000);

  await page.screenshot({path: `${user}_friends.png`});

  await autoScroll(page);
  // scroll until photos title appears
  while (await page.$('#bottomContent') === null) {
    await autoScroll(page);
  }

  const friends = await page.evaluate(() => {
    const list = document.getElementsByClassName('clearfix _5qo4');
    return Array.from(list).map(ele => ele.innerHTML);
  });

  await browser.close();

  return {details, friends};
};


module.exports.extractProfileData = (detailsHtml, friendsHtml) => {
  let details = detailsHtml.map(ele => $('._50f3', ele).text());
  let friends = friendsHtml.map(ele => {
    return {
      image: $('._s0._4ooo._1x2_.img', ele).attr('src'),
      name: $('.fsl.fwb.fcb', ele).text(),
      friends: $('._39g5', ele).text()
    }
  });

  return {details, friends};
};
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
  await page.waitFor(2000);
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

  await autoScroll(page);
  // scroll until video / photo frames show
  while (
    await page.$('#pagelet_timeline_medley_map') === null ||
    await page.$('#pagelet_timeline_medley_videos') === null ||
    await page.$('#pagelet_timeline_medley_photos') === null) {
    await autoScroll(page);
    await page.waitFor(500);
  }

  const friends = await page.evaluate(() => {
    const list = document.getElementsByClassName('clearfix _5qo4');
    return Array.from(list).map(ele => ele.innerHTML);
  });

  await browser.close();

  return {details, friends};
};


module.exports.extractProfileData = (detailsHtml, friendsHtml) => {
  let detailsList = detailsHtml.map(ele => $('._50f3', ele).text());
  let details = {
    work: findDetailsMatch(/Zaposlitev: /, detailsList),
    school: findDetailsMatch(/Šolanje: |Obiskuje šolo /, detailsList),
    lives: findDetailsMatch(/Živi v kraju /, detailsList),
    hometown: findDetailsMatch(/Iz kraja /, detailsList),
  };
  let friends = friendsHtml.map(ele => {
    try {
      return {
        image: $('._s0._4ooo._1x2_.img', ele).attr('src'),
        name: $('.fsl.fwb.fcb', ele).text(),
        friends: extractFriends($('._39g5', ele).text()).friends,
        username: extractUsername($('._39g5', ele).attr('href')),
        relatedFriends: extractFriends($('._39g5', ele).text()).related
      }
    } catch (e) {
      console.log('failed to extract data for: ', $('.fsl.fwb.fcb', ele).text());
    }
  });

  return {details, friends};
};

function findDetailsMatch(regex, detailsList) {
  let match = null;
  for (let i = 0; i < detailsList.length; i++) {
    if (regex.test(detailsList[i])) {
      match = detailsList[i].split(regex)[1];
    }
  }
  return match;
}

function extractFriends(friendsString) {
  let related = /skupnih prijateljev/.test(friendsString);
  let friends = Number.parseInt(friendsString.split(' ')[0]);
  return {related, friends};
}

function extractUsername(hrefString) {
  if (!/www.facebook.com/.test(hrefString)) {
    throw new Error("Username url invalid " + hrefString);
  }
  return hrefString
    .replace('https://www.facebook.com/', '')
    .replace('/friends', '');
}

module.exports.test = {
  findDetailsMatch
};
const puppeteer = require('puppeteer');
const $ = require('cheerio');
const path = require('path');


module.exports.scrapeProfileHtml = async (username, password, user, imgFolder) => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://www.instagram.com/accounts/login/');
  await page.waitForSelector('[name=username]', {visible: true});

  await page.type('[name=username]', username);
  await page.type('[name=password]', password);

  await page.click('[type=submit]');
  await page.waitFor(5000);
  await page.goto(`https://www.instagram.com/${user}`);
  await page.waitForSelector('img', {visible: true});

  await page.screenshot({path: path.join(imgFolder, `${user}.png`)});

  const details = await page.evaluate(() => {
    const details = document.getElementsByClassName('Y8-fY');

    return Array.from(details).map(ele => ele.innerHTML);
  });

  await page.evaluate(() => {
    document.getElementsByClassName('-nal3')[1].click()
  });
  await page.waitFor(1000);

  const followers = await page.evaluate(() => {
    const list = document.getElementsByClassName('_0mzm- ZUqME');
    return Array.from(list).map(ele => ele.innerHTML);
  });

  await browser.close();

  return {details, followers};
};


module.exports.extractProfileData = (detailsHtml, followersHtml) => {
  let profileDetails = detailsHtml.map(node => $('.g47SY ', node).text());
  let followers = followersHtml.map(node => ({
    username: $('.xLCgt.MMzan.KV-D4', node).text(),
    img: $('._6q-tv', node).attr('src')
  }));

  return {
    details: {
      posts: profileDetails[0],
      followers: profileDetails[1],
      following: profileDetails[2]
    },
    followers
  };
};
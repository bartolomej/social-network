const instagram = require('./clients/instagram');
const facebook = require('./clients/facebook');
const FacebookUser = require('./models/FacebookUser');
const graphdb = require('./db');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '..', '.env')});


module.exports.fetchFacebookAccount = async function (username) {
  let html = await facebook.scrapeProfileHtml(
    process.env.FB_USERNAME, process.env.FB_PASS, username);
  let {details, friends} = facebook.extractProfileData(html.details, html.friends);

  let rootUser = new FacebookUser(username, details, friends);

  await graphdb.saveFbAccount(rootUser);
  friends.forEach(async friend => {
    await graphdb.saveFbAccount({
      name: friend.name,
      username: friend.username,
      friends_count: friend.friends
    });
    await graphdb.addFriendRelation(username, friend.username)
  });
};
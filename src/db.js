const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'social-graph'));
let session = driver.session();

module.exports.saveFbAccount = async (fbUser) => {
  await session
    .run(`CREATE (:FbAccount {
        name: '${fbUser.name}', 
        username: '${fbUser.username}', 
        friends_count: ${fbUser.friends_count}, 
        hometown: '${fbUser.hometown}', 
        lives: '${fbUser.lives}', 
        image: '${fbUser.img}'
      })`);
};

module.exports.addFriendRelation = async (username1, username2) => {
  await session
    .run(`
      MATCH (a:FbAccount), (b:FbAccount) 
      WHERE a.username = '${username1}' AND b.username = '${username2}'
      CREATE (a) - [r:FRIEND] -> (b)
      RETURN r
    `);
};
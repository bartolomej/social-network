module.exports = class FacebookUser {

  constructor({username, details, friends}) {
    this.username = username;
    //this.img = details.img;
    this.hometown = details.hometown;
    this.lives = details.lives;
    this.work = details.work;
    this.school = details.school;
    this.friends_count = friends.length;
  }

  print() {
    console.log(this.username);
  }

};
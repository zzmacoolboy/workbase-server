// - category: Email
// - subject
// - lastMessageId
// - createdAt
// - updatedAt
Threads = new Mongo.Collection('threads');

Threads.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
});

Threads.before.update(function(userId, doc, fieldNames, modifier, options) {
  modifier.$set = modifier.$set || {};
  modifier.$set.updatedAt = new Date();
});

Threads.create = (category, subject) => {
  return Threads.insert({
    category,
    subject
  });
};

Threads.ensureMember = (thread, user) => {
  ThreadUsers.upsert({
    threadId: thread._id,
    userType: user.className(),
    userId:   user._id
  }, {$set: {
    read: false
  }});
};

Threads.addMessage = (thread, user, message) => {
  let mid = Messages.insert({
    threadId: thread._id,
    userType: user.className(),
    userId:   user._id,
    content:  message.content,
    emailId:  message.emailId
  });
  Threads.update(thread._id, {$set: {lastMessageId: mid}});
  ThreadUsers.update({threadId: thread._id}, {$set: {read: false}}, {multi: true}); // mark unread
  ThreadUsers.update({threadId: thread._id, userType: user.className(), userId: user._id}, {$set: {read: true}}); // mark read
  return mid;
};

Threads.helpers({
  lastMessage() {
    return Messages.findOne(this.lastMessageId);
  }
});

let categories = {};
ThreadCategories = {
  add: (category, defs) => {
    let _obj = {};
    _obj[category] = defs;
    _.extend(categories, _obj);
  },
  get: (category) => {
    return categories[category];
  }
};

ThreadCategories.add("Email", {
  icon: "fa fa-envelope-o",
  iconUnread: "fa fa-envelope"
});
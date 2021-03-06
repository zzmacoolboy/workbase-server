Threads.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  _.defaults(doc, {scope: 'private'});
});

ThreadUsers.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  doc.star      = false;
  doc.archive   = false;
});

const sanitizeHtml = require('sanitize-html');
const purgeHtml = (html) => {
  return html && _.unescape(sanitizeHtml(html, {allowedTags: [], allowedAttributes: []}).trim());
};
Messages.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
  // internal规则
  // 1 发消息时可选择为内部消息（优先）
  // 2 若没有选择，则默认为外部消息
  // 3 没有外部联系人时为内部消息
  // 第2条和第3条不可交换！（不然会覆盖第一条）
  _.defaults(doc, {internal: false, contentType: 'text'});
  if (ThreadUsers.find({threadId: doc.threadId, userType: 'Contacts'}).count() === 0) {
    _.extend(doc, {internal: true});
  }

  if (doc.contentType === 'log') {
    doc.summary = doc.content;
  } else {
    let strippedText = purgeHtml(doc.content);
    if (!strippedText) {
      // image
      if (/<img src/.test(doc.content)) {
        doc.contentType = 'image';
      }
    } else {
      doc.summary = strippedText.slice(0, 250);
    }
  }
});

Messages.before.update(function(userId, doc, fieldNames, modifier, options) {
  if (_.includes(fieldNames, 'content')) {
    modifier.$set.updatedAt = new Date();
  }
});

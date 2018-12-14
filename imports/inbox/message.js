import './message.html';
import './message.css';

import ClipboardJS from 'clipboard';

// copy到剪贴板
let clipboard = (text, event) => {
  let cb = new ClipboardJS('.null', {
    text: () => text
  });

  cb.on('success', function(e) {
    // console.log(e);
    cb.off('error');
    cb.off('success');
  });

  cb.on('error', function(e) {
    // console.log(e);
    cb.off('error');
    cb.off('success');
  });

  cb.onClick(event);
};

Template.Message.helpers({
  userName() {
    let user = this.user();
    if (!user) return;

    switch(this.userType) {
    case 'Users':
      return user.name();
    default:
      return user.address();
    }
  },
  isHTML() {
    return this.contentType === 'html';
  }
});

Template.Message.events({
  "mouseenter .message .message-header"(e, t) {
    e.preventDefault();
    $(e.target).find(".message-actions").removeClass('hide');
  },
  "mouseleave .message .message-header"(e, t) {
    e.preventDefault();
    $(e.target).find(".message-actions").addClass('hide');
  },
  "click .message-header"(e, t) {
    e.preventDefault();
    if (e.shiftKey) {
      let m = $(e.target).closest(".message");
      if ($(m).find(".message-content").hasClass("hide")) {
        _.each($(".message"), (m) => {
          if ($(m).find(".message-content").hasClass("hide")) {
            toggleMessage(m);
          }
        });
      } else {
        _.each($(".message"), (m) => {
          if (!$(m).find(".message-content").hasClass("hide")) {
            toggleMessage(m);
          }
        });
      }
    } else {
      let m = $(e.target).closest(".message");
      toggleMessage(m);
    }
  }
});

const toggleMessage = (m) => {
  $(m).find(".message-header .email").toggleClass("hide");
  $(m).find(".message-header .summary").toggleClass("hide");
  $(m).find(".message-content").toggleClass("hide");
};

Template.MessageActions.onRendered(function() {
  $('.message-actions [data-toggle="tooltip"]').tooltip({container: 'body', trigger: 'hover', delay: 1000});
});

Template.MessageActions.events({
  "click .btn-copy"(e, t) {
    e.stopPropagation();
    clipboard(t.data.content, e);
    $(e.target).closest('.btn-copy').attr('data-original-title', I18n.t('Copied')).tooltip('fixTitle').tooltip('show');
  }
});

const DOMPurify = require('dompurify');
Template.EmailContent.onRendered(function() {
  this.autorun(() => {
    let data = Template.currentData();

    if (data && data.content) {
      let template = Template.instance();
      let frame = template.$('iframe');
      let content = DOMPurify.sanitize(data.content) + '<style>body {font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; margin: 0px; overflow-y: hidden; font-size: 14px; font-weight: 400; color: #333;} img {max-width: 100% !important; height: auto !important; cursor: zoom-in;} a img {cursor: pointer;} em {background: yellow;}</style>';
      let frameContent = frame.get(0).contentWindow.document;
      frameContent.open();
      frameContent.write(content);
      frameContent.close();
      // new Viewer(frameContent.body, _.extend(viewerjsOptions, {
      //   title: false,
      //   filter(img) { if (!$(img).closest('a').length) { return true; }}
      // }));
      _.each(frame.contents().find('a'), (aTag) => { aTag.target = '_blank'; });
      template.$(".spinner").remove();
      // $(template.parent().find('.relation-content')).removeClass('hide');
      frame.css("height", frameContent.body.offsetHeight + 'px');
      // $(template.parent().find('.relation-content')).addClass('hide');
      // Chrome
      frame.load(() => {
        // $(template.parent().find('.relation-content')).removeClass('hide');
        frame.css("height", frameContent.body.offsetHeight + 'px');
        // $(template.parent().find('.relation-content')).addClass('hide');
      });
    }
  });
});

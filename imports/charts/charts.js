ThreadCategories.add("Charts", {
  icon: "fa fa-bar-chart",
  iconUnread: "fa fa-bar-chart",
  title(thread, detail=false) { // client only
    return I18n.t(thread.subject);
  },
  details: true,
  actions() {
    return [
      {
        title: I18n.t('Daily Messages Counts'),
        icon: "fa fa-bar-chart",
        action() {
          Modal.show('MessagesDailyChart', null, {
            backdrop: 'static',
            keyboard: false
          });
        }
      },
      {
        title: I18n.t('Hourly Messages Counts'),
        icon: "fa fa-bar-chart",
        action() {
          Modal.show('MessagesHourlyChart', null, {
            backdrop: 'static',
            keyboard: false
          });
        }
      }
    ]
  }
});

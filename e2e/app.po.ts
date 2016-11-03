export class TamerboothPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('tamerbooth-app h1')).getText();
  }
}

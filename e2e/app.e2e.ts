import { TamerboothPage } from './app.po';

describe('tamerbooth App', function() {
  let page: TamerboothPage;

  beforeEach(() => {
    page = new TamerboothPage();
  })

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('tamerbooth works!');
  });
});

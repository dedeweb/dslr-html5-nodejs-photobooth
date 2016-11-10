import { FrontPage } from './app.po';

describe('front App', function() {
  let page: FrontPage;

  beforeEach(() => {
    page = new FrontPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

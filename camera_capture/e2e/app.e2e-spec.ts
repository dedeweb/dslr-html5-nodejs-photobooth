import { CameraCapturePage } from './app.po';

describe('camera-capture App', function() {
  let page: CameraCapturePage;

  beforeEach(() => {
    page = new CameraCapturePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

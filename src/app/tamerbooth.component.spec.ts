import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { TamerboothAppComponent } from '../app/tamerbooth.component';

beforeEachProviders(() => [TamerboothAppComponent]);

describe('App: Tamerbooth', () => {
  it('should create the app',
      inject([TamerboothAppComponent], (app: TamerboothAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'tamerbooth works!\'',
      inject([TamerboothAppComponent], (app: TamerboothAppComponent) => {
    expect(app.title).toEqual('tamerbooth works!');
  }));
});

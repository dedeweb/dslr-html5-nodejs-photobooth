import { Directive,  ElementRef, Input } from '@angular/core';
//copied from https://github.com/dharness/angular2-scroll-glue/blob/master/examples/app/ScrollGlue.ts
@Directive({
	selector: '[scroll-glue]',
	host: {
		'(scroll)': 'onScroll()'
	}
})
export class ScrollGlueDirective {

	public el:any;
    public isLocked: boolean = false;
    private _observer:any;
    private _oldScrollHeight: number = 0;

    constructor(private _el: ElementRef) {
      this.el = _el.nativeElement;
    }

    onScroll() {
      let percent = (this.el.scrollHeight/100);
      if (this.el.scrollHeight - this.el.scrollTop > (10*percent)) {
        this.isLocked = true;
      } else {
        this.isLocked = false;
      }
    }

    ngAfterContentInit() {
      this.el.scrollTop = this.el.scrollHeight;

      // create an observer instance
      this._observer = new MutationObserver((mutations)=> {
        if ( !this.isLocked ) {
          this._oldScrollHeight = this.el.scrollHeight;
          this.el.scrollTop = this.el.scrollHeight;
        }
      });

      // configuration of the observer:
      var config = { childList: true, subtree: true };
      var target = this.el;

      // pass in the target node, as well as the observer options
      this._observer.observe(target, config);
    }

    ngOnDestroy() {
      this._observer.disconnect();
    }

}

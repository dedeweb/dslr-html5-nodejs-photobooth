# tamerbooth
##/!\ this app is in early stage of devlopment, not working yet !

##/!\ this app use experimental new technologies likes WebRTC. Only (very) recent browser are supported. 
A photobooth web app, used to control a DSLR connected to computer. 

backend made using express server. Setup inspered by  https://javascriptrocks.wordpress.com/2016/06/04/express-with-angular-cli-in-5-minutes/


### prerequisite
#### software
	* node and npm
	* gphoto2
	
#### hardware
	* a webcam or any camera accessible through a webbrowser for displaying live viewfinder
	* a gphoto2 compatible camera, plugged in usb to the server
	* a device to display frontend to user (ideally a tablet)
	* a printer if you want to allow user to print their picture

### install

	$ npm install
	$ npm install -g angular-cli
	$ ng build
	
### dev commands : 
#### launch backend (port 3000)

	$ npm run server
	
#### launch camera-capture (with server)
	$npm run camera



### Credits

* somewhat inspired by https://github.com/porkbuns/shmile


This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.19-3.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

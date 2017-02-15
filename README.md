# tamerbooth
##/!\ this app is in early stage of development, not really stable. 

##/!\ this app use experimental new technologies likes WebRTC. Only (very) recent browser are supported. 

A photobooth web app, used to control a DSLR connected to computer. 


### prerequisite
#### software
	* node and npm
	* gphoto2
	
#### hardware
	* a webcam or any camera accessible through a webbrowser for displaying live viewfinder
	* a gphoto2 compatible camera, plugged in usb to the server
	* a device to display frontend to user (ideally a tablet)
	* a printer if you want to allow user to print their picture
	
### general principle 

The aim of this app is to allow a user to control DSLR through a tablet. In order to show the user a real time view of the image that would be taken, we use a webcam. Of course, the DSLR lens have to be less wide than the webcam. 
Once DSLR and webcam are set, pointing in the same direction, the app allow to crop image from webcam to show a view that is almost the same as the image taken by DSLR. 

The app divided in several parts : 

#### Server
The server serve different pages and api of the application, and control DSLR and printer. 

#### Front
The front page will be displayed to user, through a tablet or another device.

#### Webcam capture
This page allow to capture image from webcam and display it on the front. If this page is not launched, camera will be captured directly on front. 

#### Admin
The admin page allow user to control every aspect of the application. 

**note :** Server, front and admin page can be opened only once at a time. If you try to open a page that is already opened, you will have an error. 

For displaying the front on the tablet, I recommand the android app developped with this project : kiosapp, source code is here : https://github.com/dedeweb/kioskapp . This app display the page fullscreen, and user can not exit app. It is remote controlled by admin panel here. 

![topology diagram](/topology.png)
	

### install

	$ npm install -g angular-cli
	$ npm install -g webpack
	$ npm run install-all
	$ npm build

### usage

Run server by typing :   
	
	$ node dist/app
	
Two servers are launched : http server on port 3000, and https server on port 3043 (usefull for using app with chrome : web RTC only work in https. )

* Webcam capture can be accessed through   http://server_address:3000/camera or https://server_address:3043/camera 
* Front can be accessed through   http://server_address:3000/front or https://server_address:3043/front 
* Admin panel can be accessed through   http://server_address:3000/admin or https://server_address:3043/admin

	
	
### dev commands : 
#### launch backend (port 3000)

	$ node server/app
	
#### launch any of front modules : 
	$ cd path_of_module
	$ npm start



### Credits

* somewhat inspired by https://github.com/porkbuns/shmile
* setup inspered by  https://javascriptrocks.wordpress.com/2016/06/04/express-with-angular-cli-in-5-minutes/

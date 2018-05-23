var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');




//https://github.com/webpack/webpack/issues/1206
/*var nodeModules = {};

fs.readdirSync('../node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
*/
//console.log('Node Modules: '+ JSON.stringify(nodeModules));
module.exports =

{
    // The configuration for the server-side rendering
    name: 'server',
    target: 'node',
	node: {
	  __dirname: false,
	  __filename: false,
	},
    entry: './app.js',
    output: {
        path: path.resolve(__dirname, '../dist/') ,
        //publicPath: 'bin/',
        filename: 'app.js'
    },
    externals: {
		"express" : "commonjs express",
		"path" : "commonjs path",
		"serve-favicon" : "commonjs serve-favicon",
		"morgan" : "commonjs morgan",
		"cookie-parser" : "commonjs cookie-parser",
		"body-parser" : "commonjs body-parser",
		"request" : "commonjs request",
		"http" : "commonjs http",
		"https" : "commonjs https",
		"pem" : "commonjs pem",
		"socket.io" : "commonjs socket.io",
		"nedb" : "commonjs nedb",
		"child_process" : "commonjs child_process",
		"process" : "commonjs process",
		"fs-extra" : "commonjs fs-extra",
		"fs" : "commonjs fs",
		"sharp" : "commonjs sharp",
		"path" : "commonjs path",
		"moment" : "commonjs moment",
		"printer/lib" : "commonjs printer/lib",
		"colors/safe" : "commonjs colors/safe"
	},
    module: {
        rules: [
            { test: /\.js$/,

                loaders: [
                    //'react-hot',
                    //'babel-loader'
                    //,'jsx-loader'
                ]
            },
            //{ test: /\.css$/,  loader: path.join(__dirname, 'server', 'style-collector') + '!css-loader' },
            { test:  /\.json$/, loader: 'json-loader' }
            //{ test: /\.ejs$/, loader: 'ejs-loader?variable=data' }
        ]
    },
	plugins: [
        new CopyWebpackPlugin([
            { from: 'fake_gphoto.sh' },
			{ from: 'fake_gphoto_files/*'},
			{ from: 'overlay.png'},
			{ from: 'index.html'}
        ])
    ]
};
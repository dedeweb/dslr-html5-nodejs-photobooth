var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');




//https://github.com/webpack/webpack/issues/1206
var nodeModules = {};
fs.readdirSync('../node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

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
        path: '../dist/',
        //publicPath: 'bin/',
        filename: 'app.js'
    },
    externals: nodeModules,
    module: {
        loaders: [
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
			{ from: 'fake_gphoto_files/*'}
        ])
    ]
};
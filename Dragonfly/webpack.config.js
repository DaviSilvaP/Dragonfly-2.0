const path = require('path');

module.exports = {
	mode: 'development',

	entry: {
		main: ['./aops/checkStatusRouteAop.js', './server.js']
	},

	output: {
		path: path.resolve('dist'),
		filename: 'main.js'
	},

	devtool: 'inline-source-map',

	module: {
	  	rules: [
	  		{
	  			test: /\.css$/,
	  			use: ['style-loader', 'css-loader']
	  		},
	  		{
	  			test: /\.js$/,
	  			exclude: /node_modules/,
	  			use: {
	  				loader: 'babel-loader',
	  				options: {
	  					cacheDirectory: true
	  				}
	  			}
	  		},{
	  			test: /\.(png|jpg)$/,
	  			use: 'file-loader'
	  		}
	  	]
  	},

  	devServer: {
  		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
		}
  	}
}
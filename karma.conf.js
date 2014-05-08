// Karma configuration
// Generated on Fri May 02 2014 14:20:53 GMT+0200 (Mitteleuropäische Sommerzeit)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ 'requirejs', 'mocha', 'sinon-chai' ],


    // list of files / patterns to load in the browser
    files: [
		{pattern: 'test/data/*.*', watched: false, included: false, served: true},

		//Some neede node modules
		{pattern: 'node_modules/underscore/underscore.js', watched: false, included: false},

		{pattern: 'src/**/*.js',  included: false},
		{pattern: 'test/**/*.js', included: false},
		'test-karma/main.js'
    ],

//	exclude: [
//	  'src/spell/client/main.js'
//	],

	// web server port
	port: 9876,

	proxies: {
		'/data/': 'http://localhost:9876/base/test/data/'
	},


    // list of files to exclude
    exclude: [
      
    ],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
	    'src/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

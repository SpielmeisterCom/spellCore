
define(
	[
		"require",
		"specs/registry"
	],
	function( require, registry ) {

		var runsInBrowser = typeof window !== "undefined"
		
		
		
		var reporter
		if ( runsInBrowser ) {
			reporter = new jasmine.TrivialReporter()
		}
		else {
			require( "vendor/jasmine/src/console/TrivialConsoleReporter.js" )
			var sys = require( "sys" )
			reporter = new jasmine.TrivialConsoleReporter( sys.print, function() {} )
		}
				
		
	
		function runSpecs( type, platform, callback ) {
			var specs = []
			for ( var spec in registry ) {
				var specInfo = registry[ spec ]
				if ( specInfo.type === type && ( specInfo.platform === "common" || platform === specInfo.platform ) ) {
					specs.push( spec )
				}
			}
			
			require( specs,
				function() {
					
					var finishReporter = new jasmine.Reporter()
					finishReporter.reportRunnerResults = function() {
					
						jasmine.currentEnv_ = null
						if ( callback !== undefined ) {
							callback()
						}
					}
					
					jasmine.getEnv().addReporter( reporter )
					jasmine.getEnv().addReporter( finishReporter )
					jasmine.getEnv().execute()
				}
			)
		}
		
		return runSpecs
	}
)

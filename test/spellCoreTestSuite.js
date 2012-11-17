define(
	"test/spellCoreTestSuite",
	[
		"test/spell/math/mat3"
	],
	function() {
		"use strict";

		var testSuites          = [ ],
			tests               = [ ],
			failedTests         = [ ],
			currentTestSuite    = "",
			numberOfTotalTests  = 0,
			numberOfFailedTests = 0

		var describe = function( testSuiteName, testSuiteCallback ) {
			testSuites.push({
				name: 		testSuiteName,
				callback:   testSuiteCallback
			})
		}

		var it = function( testDescription, testCallback ) {
			tests.push({
				testSuite:          currentTestSuite,
				testDescription:    testDescription,
				callback:           testCallback
			})
		}

		//load tests from all included modules
		for( var i=0; i < arguments.length; i++ ) {
			arguments[ i ].call( undefined, describe, it )
		}

		//evaluate tests from all testsuites
		for(var i=0, length=testSuites.length; i < length; i++ ) {
			var testSuite = testSuites[ i ]

			currentTestSuite = testSuite.name
			testSuite.callback.call()
		}

		numberOfTotalTests = tests.length

		//run all tests now
		for(var i=0; i < numberOfTotalTests; i++ ) {
			var test = tests[ i ],
				logLine = "[" + (i+1) + "/" + numberOfTotalTests + "] <" + test.testSuite + "> " + test.testDescription + " "

			try {
				test.callback.call()
				logLine += "PASSES"

			} catch( e ) {
				logLine += "FAILED"
				numberOfFailedTests++

				test.exceptionMessage = e
				failedTests.push( test )
			}

			console.log( logLine )
		}


		console.log ()
		console.log ( numberOfFailedTests + " tests failed!" )
		console.log()

		if (numberOfFailedTests > 0 ) {
			for(var i=0; i<numberOfFailedTests; i++) {
				var test = failedTests[ i ]

				console.log("<" + test.testSuite + "> " + test.testDescription)
			    console.log( test.exceptionMessage )
				console.log("==================================================")
			}
		}
	}
)
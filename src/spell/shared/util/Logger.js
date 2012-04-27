define(
	'spell/shared/util/Logger',
	[
		'spell/shared/util/platform/log'
	],
	function(
		log
	) {
		'use strict'


		/**
		 * private
		 */

		var LOG_LEVEL_DEBUG = 0
		var LOG_LEVEL_INFO  = 1
		var LOG_LEVEL_WARN  = 2
		var LOG_LEVEL_ERROR = 3

		var logLevels = [
			'DEBUG',
			'INFO',
			'WARN',
			'ERROR'
		]

		var currentLogLevel = LOG_LEVEL_INFO


		var setLogLevel = function( level ) {
			currentLogLevel = level
		}

		var logWrapper = function( level, message ) {
			if( level < 0 ||
				level > 3 ) {

				throw 'Log level ' + logLevels[ level ] + ' is not supported.'
			}

			if( level < currentLogLevel ) return


			log( logLevels[ level ] + ' - ' + message )
		}

		var debug = function( message ) {
			logWrapper( LOG_LEVEL_DEBUG, message )
		}

		var info = function( message ) {
			logWrapper( LOG_LEVEL_INFO, message )
		}

		var warn = function( message ) {
			logWrapper( LOG_LEVEL_WARN, message )
		}

		var error = function( message ) {
			logWrapper( LOG_LEVEL_ERROR, message )
		}


		/**
		 * public
		 */

		return {
			LOG_LEVEL_DEBUG : LOG_LEVEL_DEBUG,
			LOG_LEVEL_INFO  : LOG_LEVEL_INFO,
			LOG_LEVEL_WARN  : LOG_LEVEL_WARN,
			LOG_LEVEL_ERROR : LOG_LEVEL_ERROR,
			setLogLevel     : setLogLevel,
			log             : logWrapper,
			debug           : debug,
			info            : info,
			warn            : warn,
			error           : error
		}
	}
)

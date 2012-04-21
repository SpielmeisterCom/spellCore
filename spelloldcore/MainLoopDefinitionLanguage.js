
define(
	[
		"spell/core/MainLoop",
		"spell/util/common/dialect"
	],
	function(
		MainLoop,
		dialect
	) {
		"use strict";
		
	
		function MainLoopDefinitionLanguage( mainLoop ) {
			var self = this
			
			this._nextVariableId = 1
			this._mainLoop = mainLoop
			this._runSyntax = new RunSyntax( mainLoop )
		}
		
		
		MainLoopDefinitionLanguage.UNIT_TICKS   = "ticks"
		MainLoopDefinitionLanguage.UNIT_SECONDS = "seconds"
		
		MainLoopDefinitionLanguage.NO_MANIFEST_ERROR = "System doesn't have a manifest: "
		
		
		MainLoopDefinitionLanguage.addMethod( "interpret", function( definitionFunction ) {
			definitionFunction( this._runSyntax )
		} )
		
		
		function RunSyntax( mainLoop ) {
			this.mainLoop = mainLoop
		}
		
		RunSyntax.addToPrototype( {
			every: function( period, unitOfPeriod, systems ) {
				var self = this

				ifSecondsDoElseIfTicksDo( unitOfPeriod,
					function() { self.mainLoop.withTimedGroup( period ) },
					function() { self.mainLoop.withTickBasedGroup( period ) }
				)
				
				systems.forEach( function( system ) {
					if ( system.manifest === undefined ) {
						throw MainLoopDefinitionLanguage.NO_MANIFEST_ERROR + system
					}
					
					self.mainLoop.withCallTo( system, system.manifest )
				} )
			},
			
			everyTick: function( definitionFunction ) {
				this.every( 1, MainLoopDefinitionLanguage.UNIT_TICKS, definitionFunction )
			},
			
			endAfter: function( duration, unitOfDuration ) {
				var self = this
				
				ifSecondsDoElseIfTicksDo( unitOfDuration,
					function() { self.mainLoop.withDurationInSeconds( duration ) },
					function() { self.mainLoop.withDurationInTicks( duration ) }
				)
				
				return {
					tick: function() {},
					ticks: function() {}
				}
			}
		} )
		
		
		function ifSecondsDoElseIfTicksDo( unit, secondsFunction, ticksFunction ) {
			if ( unit === MainLoopDefinitionLanguage.UNIT_SECONDS ) {
				secondsFunction()
			}
			else if ( unit === MainLoopDefinitionLanguage.UNIT_TICKS ) {
				ticksFunction()
			}
			else {
				throw "Invalid unit: " + unit
			}
		}
		
		
		return MainLoopDefinitionLanguage
	}
)

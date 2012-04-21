
define(
	[
		"spell/util/common/dialect"
	],
	function(
		dialect
	) {
		"use strict";
		
	
		function MainLoop() {
			this.running             = false
			this.timedCallGroups     = []
			this.tickBasedCallGroups = []
		}

		
		MainLoop.addToPrototype( {
			isRunning: function( isRunning ) {
				this.running = isRunning;
				return this;
			},
			
			withDurationInSeconds: function( durationInSeconds ) {
				this.durationInSeconds = durationInSeconds
				return this
			},
			
			withDurationInTicks: function( durationInTicks ) {
				this.durationInTicks = durationInTicks
				return this
			},
			
			withTimedGroup: function( periodInSeconds ) {
				this._currentGroup = []
				this._currentGroup.accumulatedTimeInSeconds = 0
				this._currentGroup.periodInSeconds = periodInSeconds
				this.timedCallGroups.push( this._currentGroup )
				return this
			},
			
			withTickBasedGroup: function( periodInTicks ) {
				this._currentGroup = []
				this._currentGroup.periodInTicks = periodInTicks
				this.tickBasedCallGroups.push( this._currentGroup )
				return this
			},
			
			withCallTo: function( system, manifest ) {
				this._currentGroup.push( {
					system: system,
					manifest: manifest
				} )
				return this
			}
		} )
		
		
		return MainLoop
	}
)


define(
	[
		"spell/core/MainLoop",
		"spell/core/Manifest"
	],
	function(
		MainLoop,
		Manifest
	) {
		"use strict";
		

		function MainLoopExecutor( entities, mainLoop, createEntityCreator, createEntityDestroyer, resumeLater ) {
			this._entities              = entities
			this._mainLoop              = mainLoop
			this._createEntityCreator   = createEntityCreator
			this._createEntityDestroyer = createEntityDestroyer
			this._resumeLater           = resumeLater
			
			this.totalTimeInSeconds = 0
			this.currentTick        = 0
		}
		
		MainLoopExecutor.addToPrototype( {
			execute: function() {
				if ( this._mainLoop.durationInSeconds !== 0 && this._mainLoop.durationInTicks !== 0 ) {
					this._mainLoop.running = true
					this.lastTimeInMilliseconds = Date.now()
					loop( this, this.lastTimeInMilliseconds )
				}
			}
		} )
		
		
		function loop( self, currentTimeInMilliseconds ) {
			var passedTimeInSeconds     =  ( currentTimeInMilliseconds - self.lastTimeInMilliseconds ) / 1000
			self.lastTimeInMilliseconds =  currentTimeInMilliseconds
			self.totalTimeInSeconds     += passedTimeInSeconds
			
			try {
				self._mainLoop.timedCallGroups.forEach( function( callGroup ) {
					callGroup.accumulatedTimeInSeconds += passedTimeInSeconds
					
					while ( callGroup.accumulatedTimeInSeconds >= callGroup.periodInSeconds ) {
						callGroup.accumulatedTimeInSeconds -= callGroup.periodInSeconds
	
						handleCallGroup( self, callGroup, callGroup.periodInSeconds )
					}
				} )

				self._mainLoop.tickBasedCallGroups.forEach( function( callGroup ) {
					if ( self.currentTick % callGroup.periodInTicks === 0 ) {
						handleCallGroup( self, callGroup, passedTimeInSeconds )
					}
				} )
				
				self.currentTick += 1
			
				if (
					self.totalTimeInSeconds >= self._mainLoop.durationInSeconds ||
					self.currentTick >= self._mainLoop.durationInTicks
				) {
					stopExecution( self )
				}
				else {
					self._resumeLater( function( currentTime ) { loop( self, currentTime ) } )
				}
			}
			catch( exception ) {
				stopExecution( self )
				throw exception
			}
		}

		
		
		function handleCallGroup( self, callGroup, passedTimeInSeconds ) {
			callGroup.forEach( function( callInGroup ) {
				var argumentsToPass = []
				var entityUpdaters = []
				
				callInGroup.manifest.arguments.forEach( function( argument ) {
					switch ( argument.type ) {
						case Manifest.ARGUMENT_PASSED_TIME:
							argumentsToPass.push( passedTimeInSeconds )
							
							break
						
						case Manifest.ARGUMENT_CREATE_ENTITY:
							var entityCreator = self._createEntityCreator()
							argumentsToPass.push( entityCreator.createEntity.bind( entityCreator ) )
							entityUpdaters.push( entityCreator )
							
							break
							
						case Manifest.ARGUMENT_DESTROY_ENTITY:
							var entityDestroyer = self._createEntityDestroyer()
							argumentsToPass.push( entityDestroyer.destroyEntity.bind( entityDestroyer ) )
							entityUpdaters.push( entityDestroyer )
							
							break
							
						case Manifest.ARGUMENT_ENTITIES:
							var entities = self._entities.query( argument.queryId )
							argumentsToPass.push( entities )
							
							break
							
						default:
							throw "Unexpected argument type: " + argumentsOrQuery.type
					}
				} )

				callInGroup.system.apply( undefined, argumentsToPass )
				
				entityUpdaters.forEach( function( entityUpdater ) {
					entityUpdater.commit()
				} )
			} )
		}
		
		function stopExecution( self ) {
			self._mainLoop.running = false
		}
		
		
		
		return MainLoopExecutor
	}
)

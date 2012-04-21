
define(
	[
		"spell/core/callNextFrame",
		"spell/core/Entities",
		"spell/core/EntityCreator",
		"spell/core/EntityDestroyer",
		"spell/core/load",
		"spell/core/MainLoop",
		"spell/core/MainLoopDefinitionLanguage",
		"spell/core/MainLoopExecutor",
		"spell/core/prepareQueries",
		"spell/util/browser/rendering/loadImagesAndPassTo"
	],
	function(
		callNextFrame,
		Entities,
		EntityCreator,
		EntityDestroyer,
		load,
		MainLoop,
		MainLoopDefinitionLanguage,
		MainLoopExecutor,
		prepareQueries,
		loadImagesAndPassTo
	) {
		"use strict";
		
	
		function Spell( path ) {
			this.isRunningInBrowser = typeof window !== "undefined"
			
			this.path = path
			
			this.entities      = Entities.create()
			this.mainLoop      = MainLoop.create()
			this.isInitialized = false
			
			this._mainLoopDefinitionFunction          = function() {}
			this._beforeLoadingInitializationFunction = function() {}
		}
		
		
		Spell.TICKS   = MainLoopDefinitionLanguage.UNIT_TICKS
		Spell.SECONDS = MainLoopDefinitionLanguage.UNIT_SECONDS
		
		
		Spell.addToPrototype( {
			beforeAssetsAreLoadedDo: function( initializationFunction ) {
				this._beforeLoadingInitializationFunction = initializationFunction
			},
			
			afterAssetsAreLoadedDo: function( initializationFunction ) {
				this._afterLoadingInitializationFunction = initializationFunction
			},
			
			
			
			defineMainLoop: function( definitionFunction ) {
				this._mainLoopDefinitionFunction = definitionFunction
			},
			
			run: function() {
				var self = this
				
				load( self.path, function( registry ) {
					self.registry = registry
					
					var mainLoopDefinitionLanguage = new MainLoopDefinitionLanguage( self.mainLoop )
					mainLoopDefinitionLanguage.interpret( self._mainLoopDefinitionFunction )
					self.mainLoop.timedCallGroups.concat( self.mainLoop.tickBasedCallGroups ).forEach( function( callGroup ) {
						callGroup.forEach( function( callInGroup ) {
							prepareQueries( self.entities, callInGroup.manifest )
						} )
					} )
					
					var loadImages = function( imageInformation ) { self._imageInformation = imageInformation }
					var entityCreator = EntityCreator.create( self.entities, self.registry )
					self._beforeLoadingInitializationFunction( loadImages, entityCreator.createEntity.bind( entityCreator ) )
					entityCreator.commit()
					
					if ( self._imageInformation === undefined || !self.isRunningInBrowser ) {
						self.isInitialized = true
						runMainLoop( self )
					}
					else {
						loadImagesAndPassTo( self._imageInformation, function( loadedImages ) {
							self._afterLoadingInitializationFunction( loadedImages )
							self.isInitialized = true
							
							runMainLoop( self )
						} )
					}
				} )
			}
		} )
		
		
		function runMainLoop( self ) {
			var createEntityCreator   = function() { return EntityCreator.create( self.entities, self.registry ) }
			var createEntityDestroyer = function() { return EntityDestroyer.create( self.entities ) }
			
			var mainLoopExecutor = MainLoopExecutor.create(
				self.entities,
				self.mainLoop,
				createEntityCreator,
				createEntityDestroyer,
				callNextFrame
			)
			mainLoopExecutor.execute()
		}
		
		
		return Spell
	}
)

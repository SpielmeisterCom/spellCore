define(
	"spell/shared/util/platform/private/sound/loadSounds",
	[
		"spell/shared/util/platform/private/sound/createSound",
		"spell/shared/components/sound/soundEmitter",

		"underscore"
	],
	function (
		createSound,
		soundEmitterConstructor,

		_
		) {
		"use strict"

		var loadSounds = function ( soundManager, soundSpriteConfig, callback ) {
			var sounds            = {}
			var waitingFor        = 0
			var waitingForClones  = 0
			var maxChannels       = soundManager.checkMaxAvailableChannels()
			var availableChannels = maxChannels

			soundManager.soundSpriteConfig = soundSpriteConfig

			var generateSounds = function( ) {

				if( _.has( soundSpriteConfig.music, "index" ) === true) {
					_.each (
						_.keys( soundSpriteConfig.music.index ),
						function( soundId ) {
							sounds[ soundId ] = createSound(
								_.extend( { resource: soundSpriteConfig.music.resource }, soundSpriteConfig.music.index[ soundId ] ),
								soundManager
							)
						}
					)
				}

				if( _.has( soundSpriteConfig.fx, "index" ) === true) {
					_.each (
						_.keys( soundSpriteConfig.fx.index ),
						function( soundId ) {
							sounds[ soundId ] = createSound(
								_.extend( { resource: soundSpriteConfig.fx.resource }, soundSpriteConfig.fx.index[ soundId ] ),
								soundManager
							)
						}
					)

				}

				return sounds
			}

			var createFunctionWrapper = function( resource ) {

				var cloneloadeddataCallback = function ( ) {

					this.removeEventListener( 'canplaythrough', cloneloadeddataCallback, false)
					waitingForClones -= 1

					if ( waitingForClones === 0 ) {
						return callback( generateSounds() )
					}

				}

				var loadeddataCallback = function( html5AudioObject ) {

                    if( !soundManager.context ) {
                        this.removeEventListener( 'canplaythrough', loadeddataCallback, false)
                        soundManager.channels[ resource ] = this
                    } else {
                        soundManager.channels[ resource ] = html5AudioObject
                    }

					waitingFor -= 1

					if ( waitingFor === 0 ) {

						// After loading the ressources, clone the FX sounds into the free Channels of the soundManager
						if( _.has( soundSpriteConfig.fx, "resource" ) &&
                            !soundManager.context ) {

							var ObjectToClone = soundManager.channels[ soundSpriteConfig.fx.resource ]

							for( var i = maxChannels; i > 0; i-- ) {
								waitingForClones += 1

								var html5Audioclone = soundManager.cloneAudio( ObjectToClone )
								html5Audioclone.id = html5Audioclone.id +"_"+i

								html5Audioclone.addEventListener(
									"canplaythrough",
									cloneloadeddataCallback,
									false
								)

								soundManager.channels[ html5Audioclone.id ] = html5Audioclone
							}
						}

						if( waitingForClones === 0 ) {
							callback( generateSounds() )
						}
					}
				}

				waitingFor += 1
				maxChannels -= 1

				return soundManager.createAudio({
					id: resource,
					resource: resource,
					onloadeddata: loadeddataCallback
				})
			}

			if( _.has( soundSpriteConfig.music, "resource" ) ) {
                var html5Audio = createFunctionWrapper( soundSpriteConfig.music.resource )

                //iOS Hack
				if( availableChannels === 1 ) {

					var iosHack = function() {

						if( _.has( soundSpriteConfig.music, "resource" ) ) {
							waitingFor = 1
							html5Audio.load()
						}

						document.getElementById('game').style.display = 'block'
                        document.getElementById('viewport').removeChild( this )
					}

					document.getElementById('game').style.display = 'none'
					var soundLoad = document.createElement( 'input')
					soundLoad.type  = "submit"
					soundLoad.onclick = iosHack
					soundLoad.value = "On iPad/iPhone you have to click on this button to enable loading the sounds"
                    document.getElementById('viewport').insertBefore( soundLoad, document.getElementById('game') )

				}
			}

			if( _.has( soundSpriteConfig.fx, "resource" ) ) {
				createFunctionWrapper( soundSpriteConfig.fx.resource )
			}

		}

		return loadSounds
	}
)

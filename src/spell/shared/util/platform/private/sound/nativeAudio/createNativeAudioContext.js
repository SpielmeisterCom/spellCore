define(
	'spell/shared/util/platform/private/sound/nativeAudio/createNativeAudioContext',
	function() {
		'use strict'

        var audioElements   = {},
            audioBuffers    = {},
            audioBuffer     = function( params ) {
                this.src        = params.src
                this.onload     = params.onload
                this.onerror    = params.onerror
                this.loaded     = false
            }

        var isMutedValue = false

		var dummy = function() {}

        var createSoundId = function() {
            return nextSoundId++
        }

        var registerEvents = function() {

            //THIS ONE ONLY FIRES IF WE'RE NOT(!) LOADING BACKGROUND MUSIC
            NATIVE.events.registerHandler('soundLoaded', function(evt) {

                console.log(' >>>>>>>>>>> finished loading ' + evt.url );

                var audioBuffer = audioBuffers[ evt.url ]

                if (audioBuffer && !audioBuffer.loaded) {

                    audioBuffer.loaded = true
                    audioBuffer.onload && audioBuffer.onload( audioBuffer );

                }

            });

            NATIVE.events.registerHandler('soundError', function(evt) {

                console.log(' error loading ' + evt.url );


                var audioBuffer = audioBuffers[ evt.url ]

                if (audioBuffer ) {

                    audioBuffer.onerror && audioBuffer.onerror( audioBuffer );

                }
            });

            NATIVE.events.registerHandler('soundDuration', function(evt) {
                // only returns the duration for background music and this information is pretty useless for us

                console.log('Got sound duration ' + evt.duration );
                //evt.duration (in Seconds)
            });
        }

		var setAllMuted = function( isMute ) {
			isMutedValue = isMute
		}

		var isAllMuted = function() {
			return isMutedValue
		}

        var destroy = function( url ) {
            NATIVE.sound.destroySound( url );
        }

        var setVolume = function( url, volume ) {
            NATIVE.sound.setVolume( url, volume );
        }

        var pause = function ( url ) {
            NATIVE.sound.pauseSound( url );
        }

        var stop = function ( url ) {
            NATIVE.sound.stopSound( url );
        }


        var seekTo = function( audioResource, seekTo ) {
//           this._et = t * 1000;
//            this._startTime = Date.now();
//            NATIVE.sound.seekTo(this._src, t);
        }



        var createFixedSoundFileSrc = function( src ) {
            var srcParts = src.split( '.' )

            srcParts.pop()
            srcParts.push( 'mp3' )

            return srcParts.join( '.' )
        }

        var play = function( audioResource, id, volume, loop ) {

            var url = audioResource.src

            if (url == "resources/library/superkumba/sounds/KibaKumbaDschungel.mp3"
                || url == "resources/library/superkumba/sounds/KibaKumbaWueste.mp3"
                || url == "resources/library/superkumba/sounds/KibaKumbaHoehle.mp3"
                || url == "resources/library/superkumba/sounds/KibaKumbaArktis.mp3") {

                NATIVE.sound.playBackgroundMusic( url, volume, loop );

            } else {

                NATIVE.sound.playSound(
                    url,
                    1,
                    false
                );

            }

            return url
        }

		var createSound = function( audioBuffer ) {
            console.log('Creating sound from buffer ' + audioBuffer.src );

            return {
                /*
                 * Public
                 */
                duration : 0, //not available

                /*
                 * Private
                 *
                 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
                 */
                src : audioBuffer.src
            }
		}


		var loadBuffer = function( src, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

            src = createFixedSoundFileSrc( src )

            var audioBufferEntry = new audioBuffer({
                src    : src,
                onload : onLoadCallback
            })

            audioBuffers[ src ] = audioBufferEntry

            if (src == "resources/library/superkumba/sounds/KibaKumbaDschungel.mp3"
                || src == "resources/library/superkumba/sounds/KibaKumbaWueste.mp3"
                || src == "resources/library/superkumba/sounds/KibaKumbaHoehle.mp3"
                || src == "resources/library/superkumba/sounds/KibaKumbaArktis.mp3") {

                onLoadCallback( audioBufferEntry )

            } else {

                //trigger a load for this sound, this will trigger a sound loaded message in the future which will call the onLoadCallback
                NATIVE.sound.loadSound( src )

            }
		}

		var createWrapperContext = function() {
			return {
				tick             : dummy,
				play             : play,
				setLoop          : dummy,
				setVolume        : dummy,
				setAllMuted      : setAllMuted,
				isAllMuted       : isAllMuted,
				stop             : dummy,
				mute             : dummy,
				createSound      : createSound,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'native' } }
			}
		}

		/*
		 * Returns an audio context.
		 */
		var createAudioContext = function() {
            registerEvents();

			return createWrapperContext()
		}

		return createAudioContext
	}
)

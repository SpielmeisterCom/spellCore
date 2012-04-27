define(
	"spell/shared/util/platform/private/sound/createSound",
	[
		"spell/shared/components/sound/soundEmitter"
	],
	function(
		soundEmitterConstructor
	) {
		"use strict";

		var create = function( config, soundManager ) {

			var pauseCallback = function () {
				if ( parseFloat(this.currentTime) >= parseFloat( this.stop ) && this.paused === false) {
					this.playing = false
                    this.pause()
				}
			}

			var playingCallback = function() {
				if( this.playing === false ) {
					this.playing = true
					this.currentTime = this.start
					this.addEventListener( 'timeupdate', pauseCallback, false )
				}
			}


			var loopCallback = function() {
                if( this.playing === false ) {
                    this.removeEventListener( 'timeupdate', pauseCallback, false )
                    this.play()
                }
			}

			var removeCallback = function() {
                this.removeEventListener( 'ended', removeCallback, false )
                this.removeEventListener( 'timeupdate', pauseCallback, false )
                this.removeEventListener( 'pause', removeCallback, false )
                this.removeEventListener( 'playing', playingCallback, false )

                soundManager.remove( this )
			}

			return {
				onComplete: soundEmitterConstructor.ON_COMPLETE_STOP,
				start: config.start || 0,
				stop: config.start + config.length || config.length,
				volume: 1,
				background: false,
				resource: config.resource,

				play: function() {

                    var freeAudioObject = soundManager.getFreeChannel(this.resource, this.isBackgroundSound() )

                    if( freeAudioObject === undefined ) {
                        return
                    }

                    freeAudioObject.stop = ( freeAudioObject.duration < parseFloat(this.stop) ) ? freeAudioObject.duration : parseFloat(this.stop)
                    freeAudioObject.start = freeAudioObject.currentTime = parseFloat(this.start)
                    freeAudioObject.volume = this.volume

                    if( !soundManager.context ) {

                        if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_LOOP ) {
                            freeAudioObject.addEventListener( 'pause', loopCallback, false )

                        } else {

                            if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_REMOVE_COMPONENT ) {

                            }

                            freeAudioObject.addEventListener( 'pause', removeCallback, false )
                        }

                        //This should never happen, but if, then free object
                        freeAudioObject.addEventListener( 'ended', removeCallback, false )
                        freeAudioObject.addEventListener( 'play', playingCallback, false )

                        freeAudioObject.play()

                    } else {

                        var gainNode = soundManager.context.createGainNode()
                        var source    = soundManager.context.createBufferSource()
                        source.buffer = freeAudioObject

                        if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_LOOP ) {
                            source.loop = true
                        } else {
                            soundManager.remove( freeAudioObject )
                        }

                        source.connect(gainNode);
                        gainNode.connect(soundManager.context.destination)

                        gainNode.gain.value = this.volume
                        source.noteGrainOn( 0, this.start, config.length )
                    }


                },

				setVolume: function( volume ) {
					this.volume = volume || 1
				},

				setLoop: function() {
					this.onComplete = soundEmitterConstructor.ON_COMPLETE_LOOP
				},

				setOnCompleteRemove: function() {
					this.onComplete = soundEmitterConstructor.ON_COMPLETE_REMOVE_COMPONENT
				},

			  	setStart: function( start ) {
					this.start = start
				},

				setStop: function( stop ) {
					this.stop = stop
				},

				setBackground: function( background ) {
					this.background = ( background === false) ? false : true
				},

				isBackgroundSound: function( ) {
					return this.background
				}
			}
		}

		return create
	}
)

define(
	"spell/client/systems/sound/processSound",
	[
		'spell/shared/util/platform/underscore',
        "spell/shared/components/sound/soundEmitter"
	],
	function(
		_,
		soundEmitterConstructor
	) {
		"use strict"

		var playing = {}

		return function(
			sounds, entities
		) {

			_.each( entities, function( entity ) {

				if( sounds[ entity.soundEmitter.soundId ] === undefined ) return

				var sound = _.clone(sounds[ entity.soundEmitter.soundId ])

				if( playing[ entity.id ] === undefined ) {

					if( entity.soundEmitter.onComplete === soundEmitterConstructor.ON_COMPLETE_LOOP ) {

						sound.setLoop()

					} else if( entity.soundEmitter.onComplete === soundEmitterConstructor.ON_COMPLETE_STOP ) {

					} else if( entity.soundEmitter.onComplete === soundEmitterConstructor.ON_COMPLETE_REMOVE_COMPONENT ) {
						sound.setOnCompleteRemove()
					}


					if( entity.soundEmitter.start !== false ) {
						sound.setStart( entity.soundEmitter.start )
					}

					if( entity.soundEmitter.stop !== false ) {
						sound.setStop( entity.soundEmitter.stop )
					}

					sound.setBackground( entity.soundEmitter.background )

					sound.setVolume( entity.soundEmitter.volume )

					sound.play();

					playing[ entity.id ] = true
				}

			} )
		}
	}
)

define(
	"spell/shared/components/sound/soundEmitter",
	function() {
		"use strict"

		var soundEmitter = function( args ) {
			this.soundId    = args.soundId
			this.volume     = args.volume     || 1
			this.muted      = args.muted      || false
			this.onComplete = args.onComplete || ''
			this.start      = args.start      || false
			this.stop       = args.stop       || false
			this.background = args.background || false
		}

		soundEmitter.ON_COMPLETE_LOOP               = 1
		soundEmitter.ON_COMPLETE_REMOVE_COMPONENT   = 2
		soundEmitter.ON_COMPLETE_STOP               = 3

		return soundEmitter
	}
)

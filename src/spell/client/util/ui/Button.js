define(
	"spell/client/util/ui/Button",
    [
        'spell/shared/util/platform/underscore'
    ],
	function(

        _
        ) {
        "use strict"

        var setDisabled = function( value ) {
            this.disabled = !!value
        }

        var onPressed = function() {
            if( !!this.pressedTextureId ) {
                this.entity.appearance.textureId = this.pressedTextureId
            }
        }

        var onReleased = function() {
            this.entity.appearance.textureId = this.textureId
        }

        var Button = function( entityRef, config ) {
            this.entity    = entityRef
            this.textureId = entityRef.appearance.textureId
            this.pressedTextureId = ( _.has( config, "pressedTextureId" ) ) ? config.pressedTextureId : undefined
        }

        Button.prototype = {
            setDisabled      : setDisabled,
            onPressed        : onPressed,
            onReleased       : onReleased
        }

        return Button
    }
)

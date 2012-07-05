define(
	"spell/client/util/ui/ToggleButton",
    [
        'spell/functions'
    ],
	function(

        _
        ) {
        "use strict"

        var toggle = function( value ) {

            this.entity.on.value = ( value !== undefined ) ?  !!value : !this.entity.on.value

            if( this.entity.on.value === false ) {
                this.setOffImage()
            } else {
                this.restoreTexture()
            }
        }

        var restoreTexture = function() {
            this.entity.appearance.textureId = this.textureId
        }

        var getOnValue = function() {
            return this.entity.on.value
        }

        var setDisabled = function( value ) {
            this.disabled = !!value
        }

        var onPressed = function() {
            if( !!this.pressedTextureId ) {
                this.entity.appearance.textureId = this.pressedTextureId
            }
        }

        var setOffImage = function() {
            if( !!this.offTextureId ) {
                this.entity.appearance.textureId = this.offTextureId
            }
        }

        var ToggleButton = function( entityRef, config ) {
            this.entity           = entityRef
            this.textureId        = this.entity.appearance.textureId
            this.pressedTextureId = ( _.has( config, "pressedTextureId" ) ) ? config.pressedTextureId : undefined
            this.offTextureId     = ( _.has( config, "offTextureId" ) )     ? config.offTextureId     : undefined

            if( this.entity.on.value === false ) {
                this.setOffImage()
            }
        }

        ToggleButton.prototype = {
            setDisabled      : setDisabled,
            onPressed        : onPressed,
            onReleased       : restoreTexture,
            toggle           : toggle,
            getOnValue       : getOnValue,
            setOffImage      : setOffImage,
            restoreTexture   : restoreTexture
        }

        return ToggleButton
    }
)

define(
	"spell/client/systems/uiSystem",
	[
        'spell/shared/util/Events',

		'spell/shared/util/platform/underscore'
	],
	function(
        Events,

		_
	) {
		"use strict"

        var resetAllPressed = function( uiManager, entities ) {
            _.each(
                entities,
                function( entity ) {
                    if( entity.clickable.pressed === true ) {
                        uiManager.triggerEvent( entity.id, "onAbort" )
                    }

                    entity.clickable.pressed = false
                }
            )
        }

        var findClickedEntity = function( entities, clickEvent ) {
            return _.find( entities, function( entity ) {

                var left   = entity.boundingBox.x,
                    right  = left + entity.boundingBox.width,
                    top    = entity.boundingBox.y,
                    bottom = top + entity.boundingBox.height,
                    x      = clickEvent.position[ 0 ],
                    y      = clickEvent.position[ 1 ]

                return (
                    right  >= x &&
                        left   <= x &&
                        bottom >= y &&
                        top    <= y
                    )
            } )
        }

        var processClickEvents = function( uiManager, clickEvents, entities ) {
            _.each(
                clickEvents,
                function( clickEvent ) {

                    var entity = findClickedEntity( entities, clickEvent )

                    if( !entity ) {
                        if( clickEvent.type === "mouseup" ) resetAllPressed( uiManager, entities )

                        return
                    }

                    if( entity.clickable.pressed === false && clickEvent.type === "mouseup" ) {
                        resetAllPressed( uiManager, entities )
                        return

                    } else if( entity.clickable.pressed === false && clickEvent.type === "mousedown" ) {
                        uiManager.triggerEvent( entity.id, clickEvent.type )
                        entity.clickable.pressed = true

                    } else if( entity.clickable.pressed === true && clickEvent.type === "mouseup" ) {
                        uiManager.triggerEvent( entity.id, clickEvent.type )
                        entity.clickable.pressed = false
                    }
                }
            )
        }

		var process = function(
            inputEvents,
			entities
		) {

            var clickEvents = _.filter( inputEvents, function( event ) {
                    return ( event.type === "mousedown" || event.type === "mouseup" )
                }
            )

            if( _.isEmpty(clickEvents) ) return

            processClickEvents( this.uiManager, clickEvents, entities )
		}

		var uiSystem = function(
			uiManager
		) {
			this.uiManager   = uiManager
		}

        uiSystem.prototype = {
			process : process
		}


		return uiSystem
	}
)

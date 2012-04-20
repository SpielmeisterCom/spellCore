define(
	"spell/client/util/ui/createUiManager",
    [
        "spell/client/util/ui/Button",
        "spell/client/util/ui/ToggleButton",

        "underscore"
    ],
	function(
        Button,
        ToggleButton,

        _
        ) {
		"use strict"

        var ABSOLUTE_LAYOUT = "absolute"
        var RELATIVE_LAYOUT = "relative"

        var eventNames = [
            'onPress',
            'onClick',
            'onAbort'
        ]

        var createUiManager = function( entityManager, constants ) {

            var uiEntitiesEvents = {}

            var calculateAxisMagnitude = function( layoutType, containerPos, containerVal, calculatedPos, elementPos , elementVal ) {

                if( !elementVal ) {
                    return ( layoutType === ABSOLUTE_LAYOUT ) ? containerVal : containerVal - elementPos
                }

                var availableVal = ( elementVal > containerVal && !!containerVal ) ? containerVal : elementVal


                if( layoutType === ABSOLUTE_LAYOUT ) {
                    var calculated = ( availableVal > containerVal && !!containerVal ) ? containerVal : availableVal

                    return ( calculated + calculatedPos > containerVal + containerPos && !!containerVal ) ?
                        containerVal - Math.abs(calculatedPos - containerPos)
                        : calculated
                } else {
                    var calculated =  ( !!containerVal && elementPos ) ? ( containerVal - elementPos ) : availableVal

                    return ( availableVal > calculated  ) ? calculated : availableVal
                }
            }


            var calculateAxis = function( layoutType, containerPos, elementPos ) {

                if( layoutType === ABSOLUTE_LAYOUT) {
                    return ( elementPos < containerPos && !!containerPos ) ? containerPos : elementPos
                } else {
                    return containerPos + elementPos
                }
            }

            var createEventsFromElement = function( element, UIElement ) {
                var eventConfig = {}

                _.each(
                    eventNames,
                    function( eventName ) {
                        if( _.has( element, eventName ) ) {

                            eventConfig[ eventName ] = function() {
                                if( eventName === "onPress" ) {
                                    UIElement.onPressed()

                                } else {
                                    UIElement.onReleased()
                                }

                                element[ eventName ].call( UIElement )
                            }
                        }
                    }
                )

                return eventConfig
            }

            var createUiElement =  function( entity, elementConfig ) {

                if( _.has( entity, "on" ) && _.has( entity, "clickable" ) ) {
                    return new ToggleButton( entity, elementConfig )

                } else if( _.has( entity, "clickable" ) ) {
                    return new Button( entity, elementConfig )
                }

            }

            var triggerEvent = function( entityId, eventName ) {

                var events = uiEntitiesEvents[ entityId ]

                var key = ( eventName === "mousedown" ) ? "onPress" :
                   ( eventName === "mouseup" ) ? "onClick" : eventName

                if( !_.isFunction( events[ key ] ) ) return

                events[key]()
            }

            var calculateBoundingBox = function( element, uiElementConfig ) {
                var boundingBoxConfig = {}

                boundingBoxConfig.x      = ( !element.boundingBox || !_.has( element.boundingBox, "x" ) )      ? uiElementConfig.screenPosition[ 0 ]  : element.boundingBox.x
                boundingBoxConfig.y      = ( !element.boundingBox || !_.has( element.boundingBox, "y" ) )      ? uiElementConfig.screenPosition[ 1 ]  : element.boundingBox.y
                boundingBoxConfig.width  = ( !element.boundingBox || !_.has( element.boundingBox, "width" ) )  ? uiElementConfig.dimension[ 0 ]       : element.boundingBox.width
                boundingBoxConfig.height = ( !element.boundingBox || !_.has( element.boundingBox, "height" ) ) ? uiElementConfig.dimension[ 1 ]       : element.boundingBox.height

                return boundingBoxConfig
            }

            var drawItem = function( element, containerDimension ) {

                var xPositionContainer = containerDimension.xPositionContainer || 0
                var yPositionContainer = containerDimension.yPositionContainer || 0
                var widthContainer     = containerDimension.widthContainer     || 0
                var heightContainer    = containerDimension.heightContainer    || 0

                var layoutType         = ( _.has( element, "layout") && element.layout === ABSOLUTE_LAYOUT ) ? ABSOLUTE_LAYOUT : RELATIVE_LAYOUT

                var xPosition = _.has( element, "xPosition" ) ? calculateAxis( layoutType, xPositionContainer, parseInt( element.xPosition ) ) : xPositionContainer
                var yPosition = _.has( element, "yPosition" ) ? calculateAxis( layoutType, yPositionContainer, parseInt( element.yPosition ) ) : yPositionContainer

                var width     = Math.abs(calculateAxisMagnitude(
                    layoutType,
                    xPositionContainer,
                    widthContainer,
                    xPosition,
                    parseInt(element.xPosition) || 0,
                    parseInt(element.width)     || 0
                ))


                var height    = Math.abs(calculateAxisMagnitude(
                    layoutType,
                    yPositionContainer,
                    heightContainer,
                    yPosition,
                    parseInt(element.yPosition) || 0,
                    parseInt(element.height)    || 0
                ))

                var yPositionOnCanvas = ( constants.ySize > yPosition ) ? constants.ySize - yPosition - height : 0

                var uiElementConfig = {
                    position       : [ xPosition, yPositionOnCanvas, 0 ],
                    screenPosition : [ xPosition, ( yPosition > height) ? yPosition - height : yPosition , 0 ],
                    textureId : element.textureId,
                    scale     : [ width, height, 0 ],
                    dimension : [ width, height, 0 ]
                }

                uiElementConfig.boundingBox = calculateBoundingBox( element, uiElementConfig )

                var entityName = element.type

                switch( entityName ) {

                    case "container":

                        containerDimension.xPositionContainer = xPosition
                        containerDimension.yPositionContainer = yPosition
                        containerDimension.widthContainer     = width
                        containerDimension.heightContainer    = height

                        entityName = "container"

                        break
                    case "label":
                        uiElementConfig.text = element.string
                        uiElementConfig.position = uiElementConfig.screenPosition
//                        console.log( uiElementConfig )
                        break
                    case "button":
                        if( _.has( element, "enableToggle" ) && element.enableToggle === true ) {
                            uiElementConfig.enableToggle = true
                            uiElementConfig.on           = ( _.has( element, "on" ) )           ? !!element.on     : true
                            uiElementConfig.offTextureId = ( _.has( element, "offTextureId" ) ) ? element.offTextureId : undefined
                        }

                        uiElementConfig.pressedTextureId = ( _.has( element, "pressedTextureId" ) ) ? element.pressedTextureId : undefined

                        break
                    default:

                }

                var uiEntity = entityManager.createEntity(
                    entityName,
                    [ uiElementConfig ]
                )

                uiEntitiesEvents[ uiEntity.id ] = createEventsFromElement(
                    element,
                    createUiElement(
                        uiEntity,
                        uiElementConfig
                    )
                )

                return containerDimension
            }


            var parseObject = function( object, containerDimension ) {

                var containerDimension = ( !!containerDimension ) ? _.clone(containerDimension) : {}

                var newContainerDimension = drawItem( object, containerDimension )

                if( _.isArray( object.items ) ) {

                    _.each(
                        object.items,
                        function( item ) {
                            parseObject( item, newContainerDimension )
                        }
                    )

                }
            }

            return {
                parseConfig  : parseObject,
                triggerEvent : triggerEvent
            }
        }

        return createUiManager
	}
)

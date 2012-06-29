define(
	"funkysnakes/client/systems/renderPerformanceGraph",
	[
		"funkysnakes/shared/config/constants",
		"spell/shared/util/math",

		'spell/shared/util/platform/underscore'
	],
	function(
		constants,
		math,

		_
	) {
		"use strict"


		/*
		 * private
		 */

		var sizeX, sizeY, maxFps, valueWidth, startTime, displayPeriodInS
		sizeX            = 1024
		sizeY            = 50
		maxFps           = 100
		valueWidth       = 2
		displayPeriodInS = 5


		var drawGraph = function( renderingContext, config ) {
			renderingContext.save()
			{
				renderingContext.translate( config.position )

				renderingContext.setFillStyleColor( [ 0.0, 0.0, 0.0 ] )
				renderingContext.fillRect( 0, 0, config.size[ 0 ], config.size[ 1 ] )

				// draw series
				_.each(
					config.series,
					function( series ) {
						renderingContext.setFillStyleColor( series.color )
						drawBuffer( renderingContext, series.values, config.maxValue, config.size[ 1 ] )
					}
				)

				// draw tick lines
				_.each(
					config.tickLines,
					function( tickLine ) {
						drawTickLine( renderingContext, config.maxValue, config.size[ 0 ], config.size[ 1 ], tickLine.color, tickLine.y )
					}
				)

//				drawSecondMarkers( renderingContext, config.size[ 0 ], config.size[ 1 ], displayPeriodInS )
			}
			renderingContext.restore()
		}


		var drawBuffer = function( renderingContext, buffer, maxValue, sizeY ) {
			var positionX, positionY, valueHeight
			positionX = 0
			positionY = sizeY

			_.each(
				buffer,
				function( value ) {
					positionX   += valueWidth
					valueHeight = Math.round( math.clamp( value / maxValue * sizeY, 0, sizeY ) )

					renderingContext.fillRect(
						positionX,
						positionY - valueHeight,
						valueWidth,
						valueHeight
					)
				}
			)
		}


		var drawTickLine = function( renderingContext, maxValue, sizeX, sizeY, color, y ) {
			var positionY = Math.floor( ( 1 - y / maxValue ) * sizeY )

			renderingContext.setFillStyleColor( color )
			renderingContext.fillRect( 0, positionY, sizeX, 1 )
		}


//		var drawSecondMarkers = function( renderingContext, sizeX, sizeY, displayPeriodInS ) {
//			var numberOfMarks = Math.max( Math.floor( displayPeriodInS ) - 1, 0 )
//
//			if( numberOfMarks === 0 ) return
//
//			for( var i = 1; i <= numberOfMarks; i++ ) {
//				var positionX = Math.round( sizeX / ( numberOfMarks + 1 ) * i )
//
//				renderingContext.setFillStyleColor( [ 0.5, 0.5, 0.5 ] )
//				renderingContext.fillRect( positionX, 0, 1, sizeY )
//			}
//		}


		/*
		 * public
		 */

		var render = function(
			timeInMs,
			deltaTimeInMs,
			seriesValues,
			renderingContext
		) {
//			// draw FPS graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, 0 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : maxFps,
//					tickLines : [
//						{
//							y : 30,
//							color : [ 0.5, 0.5, 0.5 ]
//						},
//						{
//							y : 60,
//							color : [ 1.0, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'FPS',
//							color  : [ 0.25, 0.35, 0.75 ],
//							values : seriesValues.fps.values
//						}
//					]
//				}
//			)
//
//			// total time spent rendering graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, sizeY + 2 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 40,
//					tickLines : [
//						{
//							y : 10,
//							color : [ 0.5, 0.5, 0.5 ]
//						},
//						{
//							y : 20,
//							color : [ 0.66, 0.66, 0.66 ]
//						},
//						{
//							y : 30,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'total time spent',
//							color  : [ 0.72, 0.44, 0.32 ],
//							values : seriesValues.totalTimeSpent.values
//						},
//						{
//							name   : 'time spent rendering',
//							color  : [ 0.25, 0.72, 0.32 ],
//							values : seriesValues.timeSpentRendering.values
//						}
//					]
//				}
//			)

//			// draw ping graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - sizeY ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 150,
//					tickLines : [
//						{
//							y : 50,
//							color : [ 0.5, 0.5, 0.5 ]
//						},
//						{
//							y : 100,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'Ping',
//							color  : [ 0.25, 0.35, 0.75 ],
//							values : seriesValues.ping.values
//						}
//					]
//				}
//			)


//			// draw relativeClockSkew graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - sizeY ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 2,
//					tickLines : [
//						{
//							y : 1,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'relativeClockSpeed',
//							color  : [ 0.25, 0.35, 0.75 ],
//							values : seriesValues.relativeClockSkew.values
//						}
//					]
//				}
//			)


//			// draw localTime % 2000 graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - ( sizeY + 2 ) * 3 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 2000,
//					tickLines : [
//						{
//							y : 1000,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'localTime',
//							color  : [ 0.25, 0.85, 0.75 ],
//							values : seriesValues.localTime.values
//						}
//					]
//				}
//			)
//
//
//			// draw remoteTime % 2000 graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - ( sizeY + 2 ) * 2 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 2000,
//					tickLines : [
//						{
//							y : 1000,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'remoteTime',
//							color  : [ 0.91, 0.32, 0.17 ],
//							values : seriesValues.remoteTime.values
//						},
//						{
//							name   : 'newRemoteTimeTransfered',
//							color  : [ 1.0, 0.0, 0.0 ],
//							values : seriesValues.newRemoteTimeTransfered.values
//						}
//					]
//				}
//			)


			// draw received % 10000 graph
			drawGraph(
					renderingContext,
					{
						position  : [ 0, constants.ySize - sizeY ],
						size      : [ sizeX, sizeY ],
						maxValue  : 5000,
						tickLines : [
							{
								y : 1250,
								color : [ 0.5, 0.5, 0.5 ]
							},
							{
								y : 2500,
								color : [ 0.5, 0.5, 0.5 ]
							},
							{
								y : 3750,
								color : [ 0.5, 0.5, 0.5 ]
							}
						],
						series : [
							{
								name   : 'charsSent',
								color  : [ 0.0, 1.0, 0.0 ],
								values : seriesValues.charsSent.values
							},
							{
								name   : 'charsReceived',
								color  : [ 1.0, 0.0, 0.0 ],
								values : seriesValues.charsReceived.values
							}
						]
					}
			)


//			// draw relativeClockSkew graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - ( sizeY + 2 ) * 4 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 2,
//					tickLines : [
//						{
//							y : 1,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'relativeClockSkew',
//							color  : [ 0.91, 0.32, 0.17 ],
//							values : seriesValues.relativeClockSkew.values
//						}
//					]
//				}
//			)
//
//
//			// draw deltaLocalRemoteTime graph
//			drawGraph(
//				renderingContext,
//				{
//					position  : [ 0, constants.ySize - ( sizeY + 2 ) * 3 ],
//					size      : [ sizeX, sizeY ],
//					maxValue  : 500,
//					tickLines : [
//						{
//							y : 250,
//							color : [ 0.5, 0.5, 0.5 ]
//						}
//					],
//					series : [
//						{
//							name   : 'deltaLocalRemoteTime',
//							color  : [ 0.7, 0.35, 0.75 ],
//							values : seriesValues.deltaLocalRemoteTime.values
//						}
//					]
//				}
//			)
		}

		return render
	}
)

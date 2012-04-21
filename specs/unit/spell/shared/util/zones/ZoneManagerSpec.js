define(
	[
		"spell/shared/util/zones/ZoneManager"
	],
	function(
		ZoneManager
	) {
		"use strict"
		
		
		describe( "ZoneManager", function() {
		
			var globals = {
				aGlobal: "a globally accessible value"
			}
			var args = {
				arg: "argument"
			}
			
			var eventManager
			
			var myZoneTemplate
			var zoneManager
			
			beforeEach( function() {
				eventManager = {
					publish: function() {}
				}
				
				myZoneTemplate = {
					onCreate : function() {},
					onDestroy: function() {}
				}
				
				var zones = {
					"myZone": myZoneTemplate
				}
				zoneManager = new ZoneManager( eventManager, zones, globals )
			} )
			
			describe( "createZone", function() {
				it( "should call a zone's onCreate function with the creation arguments when creating it.", function() {
					spyOn( myZoneTemplate, "onCreate" )
					
					zoneManager.createZone( "myZone", args )
					
					expect( myZoneTemplate.onCreate ).toHaveBeenCalledWith( globals, args )
				} )
				
				it( "should call the onCreate function in the scope of the created zone instance and return it.", function() {
					myZoneTemplate.onCreate = function() { this.attribute = "attribute" }
					
					var zone = zoneManager.createZone( "myZone" )
					
					expect( zone.attribute ).toEqual( "attribute" )
				} )
				
				it( "should throw an error, if the zone type does not exist.", function() {
					var exception
					try {
						zoneManager.createZone( "nonExisting" )
					}
					catch ( e ) {
						exception = e
					}
					
					expect( exception ).toContain( ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR )
					expect( exception ).toContain( "nonExisting" )
				} )
			} )
			
			describe( "destroyZone", function() {
				
				var zone
				
				beforeEach( function() {
					zone = zoneManager.createZone( "myZone" )
				} )
				
				it( "should call the zone's onDestroy function with the destruction arguments when destroying it.", function() {
					spyOn( myZoneTemplate, "onDestroy" )
					
					zoneManager.destroyZone( zone, args )
					
					expect( myZoneTemplate.onDestroy ).toHaveBeenCalledWith( globals, args )
				} )
				
				it( "should call the onDestroy function in the scope of the destroyed zone instance.", function() {
					myZoneTemplate.onDestroy = function() { this.attribute = "attribute" }
					
					zoneManager.destroyZone( zone )
					
					expect( zone.attribute ).toEqual( "attribute" )
				} )
				
				it( "should throw an exception, if the zone is not an active zone.", function() {
					zoneManager.destroyZone( zone )
					
					var exception
					try {
						zoneManager.destroyZone( zone )
					}
					catch ( e ) {
						exception = e
					}
					
					expect( exception ).toContain( ZoneManager.IS_NO_ACTIVE_ZONE_ERROR )
				} )
			} )
			
			describe( "zones", function() {
				it( "should return all created zones.", function() {
					var zone = zoneManager.createZone( "myZone" )
					
					expect( zoneManager.activeZones() ).toEqual( [ zone ] )
				} )
				
				it( "should not return zone instances that have been destroyed.", function() {
					var zoneA = zoneManager.createZone( "myZone" )
					var zoneB = zoneManager.createZone( "myZone" )
					zoneManager.destroyZone( zoneA )
					
					expect( zoneManager.activeZones() ).toEqual( [ zoneB ] )
				} )
			} )
			
			describe( "zone events", function() {
				
				beforeEach( function() {
					spyOn( eventManager, "publish" )
				} )
				
				it( "should notify the listener when a zone is created.", function() {
					var zone = zoneManager.createZone( "myZone" )
					
					expect( eventManager.publish ).toHaveBeenCalledWith(
						[ "createZone" ],
						[ zoneManager, zone ]
					)
				} )
				
				it( "should notify the listener when a zone is destroyed.", function() {
					var zone = zoneManager.createZone( "myZone" )
					
					zoneManager.destroyZone( zone )
					
					expect( eventManager.publish ).toHaveBeenCalledWith(
						[ "destroyZone" ],
						[ zoneManager, zone ]
					)
				} )
			} )
		} )
	}
)

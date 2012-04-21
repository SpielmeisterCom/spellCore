define(
	[
		"spell/shared/util/network/snapshots"
	],
	function(
		snapshots
	) {
		"use strict"
		
		
		describe( "snapshots", function() {
			
			var firstSnapshotTime  = 2000
			var secondSnapshotTime = 2500
			var firstSnapshotData  = { value: "first snapshot's data" }
			var secondSnapshotData = { value: "second snapshot's data" }
			
			it( "should return undefined for current, next and latest, if no snapshots have been added.", function() {
				var entitySnapshots = snapshots.create()
				
				var current = snapshots.current( entitySnapshots )
				var next    = snapshots.next( entitySnapshots )
				var latest  = snapshots.latest( entitySnapshots )
				
				expect( current ).toBeUndefined()
				expect( next    ).toBeUndefined()
				expect( latest  ).toBeUndefined()
			} )
			
			it( "should return an added snapshot as the next snapshot.", function() {
				var entitySnapshots = snapshots.create()
				snapshots.add( entitySnapshots, firstSnapshotTime, firstSnapshotData )
				
				var current = snapshots.current( entitySnapshots )
				var next    = snapshots.next( entitySnapshots )
				
				expect( current ).toBeUndefined()
				expect( next    ).toEqual( {
					time: firstSnapshotTime,
					data: firstSnapshotData
				} )
			} )
			
			it( "should return the latest snapshot.", function() {
				var entitySnapshots = snapshots.create()
				
				snapshots.add( entitySnapshots, firstSnapshotTime, firstSnapshotData )
				var firstLatest = snapshots.latest( entitySnapshots )
				
				snapshots.add( entitySnapshots, secondSnapshotTime, secondSnapshotData )
				var secondLatest = snapshots.latest( entitySnapshots )
				
				expect( firstLatest ).toEqual( {
					time: firstSnapshotTime,
					data: firstSnapshotData
				} )
				expect( secondLatest ).toEqual( {
					time: secondSnapshotTime,
					data: secondSnapshotData
				} )
			} )
			
			it( "should return whether any snapshots have been added.", function() {
				var entitySnapshots = snapshots.create()
				
				var emptyBeforeAdd = snapshots.empty( entitySnapshots )
				snapshots.add( entitySnapshots, firstSnapshotTime, firstSnapshotData )
				var emptyAfterAdd = snapshots.empty( entitySnapshots )
				
				expect( emptyBeforeAdd ).toEqual( true  )
				expect( emptyAfterAdd  ).toEqual( false )
			} )
			
			describe( "forwardTo", function() {
				it( "should change nothing, if the given time if before the first snapshot.", function() {
					var entitySnapshots = snapshots.create()
					snapshots.add( entitySnapshots, firstSnapshotTime, firstSnapshotData )
					
					snapshots.forwardTo( entitySnapshots, firstSnapshotTime - 100 )
					var current = snapshots.current( entitySnapshots )
					var next    = snapshots.next( entitySnapshots )
					
					expect( current ).toBeUndefined()
					expect( next    ).toEqual( {
						time: firstSnapshotTime,
						data: firstSnapshotData
					} )
				} )
				
				it( "should forward to the snapshot at the given time.", function() {
					var entitySnapshots = snapshots.create()
					snapshots.add( entitySnapshots, firstSnapshotTime - 500, {} )
					snapshots.add( entitySnapshots, firstSnapshotTime      , firstSnapshotData )
					snapshots.add( entitySnapshots, secondSnapshotTime     , secondSnapshotData )
					
					snapshots.forwardTo( entitySnapshots, firstSnapshotTime )
					var current = snapshots.current( entitySnapshots )
					var next    = snapshots.next( entitySnapshots )
					
					expect( current ).toEqual( {
						time: firstSnapshotTime,
						data: firstSnapshotData
					} )
					expect( next ).toEqual( {
						time: secondSnapshotTime,
						data: secondSnapshotData
					} )
				} )
				
				it( "should work correctly, if the new current snapshot is also the last snapshot.", function() {
					var entitySnapshots = snapshots.create()
					snapshots.add( entitySnapshots, firstSnapshotTime - 500, {} )
					snapshots.add( entitySnapshots, firstSnapshotTime      , firstSnapshotData )
					
					snapshots.forwardTo( entitySnapshots, firstSnapshotTime )
					var current = snapshots.current( entitySnapshots )
					var next    = snapshots.next( entitySnapshots )
					
					expect( current ).toEqual( {
						time: firstSnapshotTime,
						data: firstSnapshotData
					} )
					expect( next ).toBeUndefined()
				} )
			} )
			
			describe( "robustness", function() {
				it( "should throw an exception, if a new snapshot is not the newest.", function() {
					var entitySnapshots = snapshots.create()
					snapshots.add( entitySnapshots, 1000, {} )
					
					var exception
					try {
						snapshots.add( entitySnapshots, 500, {} )
					}
					catch ( e ) {
						exception = e
					}
					
					expect( exception ).toContain( snapshots.SNAPSHOT_NOT_NEWEST_ERROR )
				} )
			} )
			
			describe( "clear", function() {
				it( "should clear all snapshots.", function() {
					var entitySnapshots = snapshots.create()
					snapshots.add( entitySnapshots, 1000, {} )
					snapshots.add( entitySnapshots, 1500, {} )
					
					snapshots.clear( entitySnapshots )
					
					expect( snapshots.latest( entitySnapshots ) ).toBeUndefined()
				} )
			} )
		} )
	}
)

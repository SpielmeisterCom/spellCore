define(
	[
		"spell/util/common/UniformGrid",
		"spell/util/common/Vector"
	],
	function(
		UniformGrid,
		Vector
	) {
		"use strict";
		
	
		describe( "UniformGrid", function() {
		
			var cellSize = 10
			
			var grid
			
			beforeEach( function() {
				grid = UniformGrid.create( cellSize )
			} )
			
			describe( "array-like behaviour", function() {
				
				it( "should set the cell size of a new grid to the same value as the original grid the method was called on.", function() {
					var filteredGrid     = grid.filter( function() { return true } )
					var mappedGrid       = grid.map( function( element ) { return element } )
					
					expect( filteredGrid.cellSize     ).toEqual( grid.cellSize )
					expect( mappedGrid.cellSize       ).toEqual( grid.cellSize )
				} )
			} )
			
			describe( "inSameCellAs", function() {
				it( "should return all entities that are in the tile defined by the given position.", function() {
					var entityA = { position: Vector.create( 5,  5 ) }
					var entityB = { position: Vector.create( 8,  8 ) }
					var entityC = { position: Vector.create( 5, 15 ) }
					
					grid.add( 0, entityA )
					grid.add( 1, entityB )
					grid.add( 2, entityC )
					
					expect( grid.inSameCellAs( Vector.create( 9, 9 ) ) ).toEqual( [ entityA, entityB ] )
					expect( grid.inSameCellAs( Vector.create( 9, 10 ) ) ).toEqual( [ entityC ] )
				} )
				
				it( "should return an empty list, if no entities are in the cell defined by the given position.", function() {
					expect( grid.inSameCellAs( Vector.create( 5, 5 ) ) ).toEqual( [] )
				} )
			} )
			
			describe( "inCellsCoveredBy", function() {
				it( "should return the entities from all cells covered by a given rectangle.", function() {
					var entityA = { position: Vector.create( 5,  5 ) }
					var entityB = { position: Vector.create( 5, 15 ) }
					var entityC = { position: Vector.create( 15, 15 ) }
					
					grid.add( 0, entityA )
					grid.add( 1, entityB )
					grid.add( 2, entityC )
					
					var minPosition = Vector.create( 5,  9 )
					var maxPosition = Vector.create( 8, 10 )
					expect( grid.inCellsCoveredBy( minPosition, maxPosition ) ).toEqual( [ entityA, entityB ] )
				} );
				
				it( "should return an empty array if no positions are in the covered tiles.", function() {
					var entity = { position: Vector.create( 15, 15 ) }
					
					grid.add( 0, entity )
					
					var minPosition = Vector.create( 5, 9 )
					var maxPosition = Vector.create( 8, 10 )
					expect( grid.inCellsCoveredBy( minPosition, maxPosition ) ).toEqual( [] )
				} )
			} )
			
			it( "should allow for overriding the function that accesses an entity's position.", function() {
				var entity = { otherPosition: Vector.create( 5, 5 ) }
				
				grid.positionFromEntity = function( entity ) { return entity.otherPosition }
				grid.add( 0, entity )
				
				expect( grid.inSameCellAs( entity.otherPosition ) ).toEqual( [ entity ] )
			} )
		} )
	}
)

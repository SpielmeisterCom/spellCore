
define(
	[		
		"spell/server/util/returnFilesInDirectory",
		
		"fs",
		
		"underscore"
	],
	function(
		returnFilesInDirectory,
		
		fs,
		
		_
	) {
		"use strict";
		
		
		describe( "returnFilesInDirectory", function() {
			it( "should return the paths of all the files in the directory and its sub-directories, relative to the directory.", function() {
				var filesInDirectory = returnFilesInDirectory( "specs/resources/directory" )

				expect( _.contains( filesInDirectory, "a"                              ) ).toEqual( true )
				expect( _.contains( filesInDirectory, "b"                              ) ).toEqual( true )
				expect( _.contains( filesInDirectory, "subdirectory/c"                 ) ).toEqual( true )
				expect( _.contains( filesInDirectory, "subdirectory/subsubdirectory/d" ) ).toEqual( true )
			} )
			
			it( "should return an empty array if the directory doesn't exist.", function() {
				var filesInDirectory = returnFilesInDirectory( "specs/resources/directory/nonExisting" )
				
				expect( filesInDirectory ).toEqual( [] )
			} )
		} )
	}
)

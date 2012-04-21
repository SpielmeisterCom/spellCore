
define(
	[
		"fs",
		"spell/util/common/dialect",
		"spell/util/node/returnFilesInDirectory"
	],
	function(
		fs,
		dialect,
		returnFilesInDirectory
	) {
		"use strict";
		
		
		describe( "returnFilesInDirectory", function() {
			it( "should return the paths of all the files in the directory and its sub-directories, relative to the directory.", function() {
				var filesInDirectory = returnFilesInDirectory( "specs/resources/directory" )

				expect( filesInDirectory.contains( "a"                              ) ).toEqual( true )
				expect( filesInDirectory.contains( "b"                              ) ).toEqual( true )
				expect( filesInDirectory.contains( "subdirectory/c"                 ) ).toEqual( true )
				expect( filesInDirectory.contains( "subdirectory/subsubdirectory/d" ) ).toEqual( true )
			} )
			
			it( "should return an empty array if the directory doesn't exist.", function() {
				var filesInDirectory = returnFilesInDirectory( "specs/resources/directory/nonExisting" )
				
				expect( filesInDirectory ).toEqual( [] )
			} )
		} )
	}
)

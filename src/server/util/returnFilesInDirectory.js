
define(
	"spell/server/util/returnFilesInDirectory",
	[
		"fs"
	],
	function(
		fs
	) {
		"use strict";
		
		
		/**
		 * Scans a given directory and returns an array with the paths of all the files in the directory and its sub-
		 * directories. The paths will be relative to the scanned array.
		 *
		 * For example, if this is the directory structure:
		 * dir/
		 * + a
		 * + subdir/
		 *   + b
		 *
		 * Then scanning "dir" with this function will result in:
		 * [ "a", "subdir/b" ]
		 *
		 * @param { String } directoryPath The path of the directory to scan.
		 */
		
		function returnFilesInDirectory( directoryPath ) {
			try {
				return scanDirectory( directoryPath, "" )
			}
			catch ( exception ) {
				if ( exception.code === "ENOENT" ) {
					return []
				}
				else {
					throw exception
				}
			}
		}
		
		
		function scanDirectory( directoryPathRelativeToRoot, currentDirectoryPathRelativeToScannedDirectory ) {
			var filesInDirectory  = []
			var directoryContents = fs.readdirSync( directoryPathRelativeToRoot )


			directoryContents.forEach( function( fileName ) {
				var filePathRelativeToRoot             = directoryPathRelativeToRoot+ "/" +fileName
				var filePathRelativeToScannedDirectory = currentDirectoryPathRelativeToScannedDirectory + fileName
				
				if ( fs.statSync( filePathRelativeToRoot ).isDirectory() ) {
					var filesInSubDirectory = scanDirectory(
						filePathRelativeToRoot,
						filePathRelativeToScannedDirectory + "/"
					)
					
					filesInDirectory = filesInDirectory.concat( filesInSubDirectory )
				}
				else {
					filesInDirectory.push( filePathRelativeToScannedDirectory )
				}
			} )
			
			return filesInDirectory
		}
		
		
		return returnFilesInDirectory
	}
)

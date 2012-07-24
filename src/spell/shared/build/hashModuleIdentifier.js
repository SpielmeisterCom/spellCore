define(
	"spell/shared/build/hashModuleIdentifier",
	[
		"spell/math/hash/SHA256"
	],
	function(
			SHA256
	) {
		return function( text ) {
			if( text === "spell/client/main" ||
				text === "spell/client/runtimeModule" ) {

				return text
			}

			var shaObj = new SHA256( text, "ASCII" )

			return shaObj.getHash( "SHA-256", "B64" )
		}
	}
)

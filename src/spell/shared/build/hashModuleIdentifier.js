define(
	"spell/shared/build/hashModuleIdentifier",
	[
		"spell/math/hash/Sha256"
	],
	function(
		Sha256
	) {
		return function( text ) {
			if( text === "spell/client/main" ||
				text === "spell/client/runtimeModule" ) {

				return text
			}

			var shaObj = new Sha256( text, "ASCII" )

			return shaObj.getHash( "SHA-256", "B64" )
		}
	}
)

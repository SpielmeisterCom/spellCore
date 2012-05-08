var spell = {
	setRuntimeModule : function( runtimeModule ) {
		this.runtimeModule = runtimeModule
	},
	start : function() {
		if( !this.runtimeModule ) throw 'Error: No runtime module provided. Make sure that the runtime module is included properly.'

		enterMain( 'spell/client/main', this.runtimeModule )
	}
}

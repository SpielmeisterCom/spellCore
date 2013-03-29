requirejs(
	[
		'spell/cli/developmentTool'
	],
	function(
		developmentTool
	) {
		developmentTool( process.argv, process.cwd(), spellCorePath )
	}
);


function performanceTest( name, test ) {
	console.log( "Running test \"" +name+ "\"..." );
	var start = Date.now();
	
	test();
	
	var end = Date.now();
	console.log( "Finished." );

	var timeInSeconds = ( end - start ) / 1000;
	document.write( "<p><strong>" +name+ "</strong>: <span id=\"" +name+ "\">" + timeInSeconds + "s</span></p>" );
}

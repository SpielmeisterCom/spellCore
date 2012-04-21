var fs               = require('fs')
var _                = require('underscore')
var sax              = require('sax')
var imagePath        = "images/ttf"
var rootPath         = "../ttf"
var outputDir        = "../code/spell/client/util/font/fonts/"

"use strict"

function writeTTFJson( resultJSON ) {
    console.log("Writing JSON TTF configfile for: "+resultJSON.name)

    var jsonFileName = outputDir +"/"+ resultJSON.name+".js"
    var fd = fs.openSync( jsonFileName, 'w+')

    var result = 'define(\n'+
    	'\t"spell/client/util/font/fonts/'+ resultJSON.name +'",\n'+
    	'\tfunction() {\n'+
    		'\t\t"use strict"\n'+
            '\t\treturn '+JSON.stringify( resultJSON, null, '\t')+
        '\n\t}\n'+
    ')\n'

    fs.writeSync(fd, result)
}

function readXmlFile( filePath, fileName ) {
    console.log("Reading XML-File: "+filePath)

    var resultJSON = {
        font: {},
        chars: {}
    }

    var parser = sax.parser( true )

    parser.onopentag = function ( node ) {

        switch( node.name ) {
            case "page":
                resultJSON.image = imagePath + "/" +node.attributes.file
                break

            case "char":
                resultJSON.chars[ node.attributes.id ] = node.attributes
                break

            case "info":
                resultJSON.font.info      = node.attributes
                resultJSON.name           = node.attributes.face.toString().replace( /\W/g, '' )
                break

            case "common":
                resultJSON.font.common = node.attributes
                break
        }

    }

    parser.onend = function () {
        // parser stream is done, and ready to have more stuff written to it.
        writeTTFJson( resultJSON )
    }

    var content = fs.readFileSync( filePath, 'utf-8')

    parser.write(content).close();

}

function parseFiles() {
    console.log( "Reading TTF directory: '"+rootPath+"'" )

   	var files = fs.readdirSync(rootPath)

   	_.each(
   		files,
   		function( fileName ) {
   			var filePath = rootPath + "/" + fileName

   			var fileType = filePath.split('.').pop()

   			if( fileType == "xml" ) {
   				readXmlFile( filePath, fileName )
   			}
   		}
   	)
}

parseFiles()



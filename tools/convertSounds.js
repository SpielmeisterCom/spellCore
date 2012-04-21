"use strict;"

var fs               = require('fs')
var _                = require('underscore')
var exec             = require('child_process').exec
var rootPath         = "../sounds"
var setPath          = rootPath + "/sets"
var outputDirName    = "output"
var outputDir        = rootPath + "/"+outputDirName
var spritesDir       = outputDirName + "/sprites"
var tmpDir           = "/tmp"

var waitingFor         = []
waitingFor["processingSounds"] = 0
waitingFor["gettingMetaData"]  = 0

var sets               = []
var soundFiles         = []
var soundFilesMetaData = {}

var supportedMedia    = [
	'mp3',
	'wav',
	'ogg'
]

function ifErrorReport(error) {
	if (error !== null) {
   		console.log('exec error: ' + error);
		throw error
 	}
}

var silenceDuration   = 1

function createSoundSprites( setObject ) {
	console.log("Creating soundSprite: "+setObject.name)

	var resultJSON = {
		name: setObject.name,
		type: "spriteConfig",
		music: {},
		fx: {}
	}

	var generateSoundFileString = function( soundFileArray ) {
		var	filesString = ""
		_.each(
			soundFileArray,
			function( name ) {
				filesString = filesString + tmpDir + "/" +name+" "
			}
		)

		return filesString
	}

	var insertSoundsMetadata = function( index, soundFileArray ) {
		var elapsedDuration = 0
		var counter = 0
		_.each(
			soundFileArray,
			function( name ) {
				var tokens = name.split('.')
				tokens.pop()
				var name = tokens.join(".")

				console.log(name)
				console.log(soundFilesMetaData)
				var soundMetaData = {
				}

				soundMetaData[name] = {
					start: elapsedDuration + (counter * silenceDuration),
					length: soundFilesMetaData[name].length
				}

				_.extend(
					resultJSON[ index ].index,
					soundMetaData
				)

				counter++
				elapsedDuration += soundFilesMetaData[name].length
			}
		)
	}


	if( _.isEmpty( setObject.music ) === false ) {

		resultJSON.music = {
			resource:  spritesDir +'/music_'+setObject.name,
			index: {}
		}

		var musicFilesString = generateSoundFileString( setObject.music )

		var targetFileName = rootPath + "/" +resultJSON.music.resource
		writeSpriteToDisk( musicFilesString, targetFileName )

		insertSoundsMetadata( "music", setObject.music )

	}


	if( _.isEmpty( setObject.fx ) === false ) {

		resultJSON.fx = {
			resource: spritesDir +'/fx_'+setObject.name,
			index: {}
		}

		var	fxFilesString = generateSoundFileString( setObject.fx )

		var targetFileName = rootPath + "/" +resultJSON.fx.resource
		writeSpriteToDisk( fxFilesString, targetFileName )

		insertSoundsMetadata( "fx", setObject.fx )

	}

	writeJSONSoundSpriteFile( resultJSON )
}

function writeJSONSoundSpriteFile( resultJSON ) {
	console.log("Writing JSON SoundSprite")

	var jsonFileName = outputDir +"/"+ resultJSON.name+".json"
	var fd = fs.openSync(jsonFileName, 'w+')

	fs.writeSync(fd, JSON.stringify( resultJSON, null, '\t'))
}

function writeSpriteToDisk( filesString, targetFile ) {
	var partialSoxCommand = 'sox ' + filesString + ' -c 2 ' + targetFile
	var convertToOtherFormats = "sox "+targetFile+'.wav '+targetFile

	var trimBeginningSilence = ''//' silence '+silenceDuration+' 0.1 1%'

	console.log("Doing: "+partialSoxCommand+".wav")
	var child = exec(partialSoxCommand+".wav"+trimBeginningSilence,
	  	function (error, stdout, stderr) {
			ifErrorReport(error)

			console.log("Creating Sound Sprite: "+targetFile+" finished")

			var child = exec(convertToOtherFormats+".ogg",
				function (error, stdout, stderr) {
					ifErrorReport(error)

					console.log("Creating Ogg Sound Sprite finished")
				}
			);

			var child = exec(convertToOtherFormats+".mp3",
				function (error, stdout, stderr) {
					ifErrorReport(error)

					console.log("Creating MP3 Sound Sprite finished")
				}
			);

		}
	);
}

function readSetDir( dir ) {
	console.log( "Reading Set directory: '"+dir+"'" )

	var files = fs.readdirSync(dir)

	_.each(
		files,
		function( fileName) {
			var filePath = dir+"/"+fileName

			var fileType = filePath.split('.').pop()

			if( fileType == "json" ) {
				sets.push( readSetJSONFile( filePath ) )
			}
		}
	)

	getAllSoundFilesFromSets( sets )

	try {
		fs.statSync( outputDir )
	} catch( e ) {
		fs.mkdirSync( outputDir )
	}

	try {
		fs.statSync( rootPath +"/"+ spritesDir )
	} catch( e ) {
		fs.mkdirSync( rootPath +"/"+  spritesDir )
	}

	_.each(
		soundFiles,
		getSoundFileMetaData
	)

	console.log( soundFiles )
}

function getAllSoundFilesFromSets( sets ) {
	_.each(
		sets,
		parseSetObject
	)
}

function parseSetObject( setObject ) {
	console.log("Parsing file: '"+setObject.name+"'" )

	soundFiles = _.union( setObject.music, setObject.fx )
}

function processSoundFile( filePath ) {

	console.log("Processing soundfile: '"+filePath+'"')

	var directories = filePath.split('/')
	directories.pop()

	var path = tmpDir
	var outPath = outputDir
	_.each(
		directories,
		function( name ) {
			path = path + "/" + name
			try {
				fs.statSync( path )
			} catch( e ) {
				fs.mkdirSync( path)
			}

			outPath = outPath + "/" + name
			try {
				fs.statSync( outPath )
			} catch( e ) {
				fs.mkdirSync( outPath)
			}
		}
	)

	_.each(
		supportedMedia,
		function( extension ) {
			convertToOtherFormat( filePath, extension )
		}
	)

	waitingFor["processingSounds"] += 1

	var soxCommand = 'sox '+rootPath+'/'+filePath+' -c 2 -r 44100 '+tmpDir+'/'+filePath+' pad  0 '+silenceDuration
	console.log('Doing: ' + soxCommand)
	var child = exec(soxCommand,
	  	function (error, stdout, stderr) {
			ifErrorReport(error)

			console.log("Converting: "+tmpDir+'/'+filePath+" finished")

			waitingFor["processingSounds"] -= 1

			if ( waitingFor["processingSounds"] === 0 ) {
				console.log( "Sound processing finished.")

				_.each(
					sets,
					createSoundSprites
				)
			}
		}
	);
}

function convertToOtherFormat( filePath, extension ) {

	var filePathWithoutExtension = filePath.split(".")
	filePathWithoutExtension.pop()
	filePathWithoutExtension = filePathWithoutExtension.join(".")

	var soxCommand = 'sox '+ rootPath + "/" +filePath +' -c 2 ' + outputDir + "/" + filePathWithoutExtension + "." + extension
	console.log('Doing: ' + soxCommand)
	var child = exec(soxCommand)
}

function getSoundFileMetaData( filePath ) {

	var absoluteFilePath = rootPath + "/" + filePath

	var tokens = filePath.split('.')
	tokens.pop()
	var filePathWithoutType = tokens.join(".")

	waitingFor["gettingMetaData"] += 1

	soundFilesMetaData[filePathWithoutType]  = {
	}

	var child = exec("soxi -D "+absoluteFilePath,
		function (error, stdout, stderr) {
			ifErrorReport(error)

			console.log("Gettings length of file '"+absoluteFilePath+"': "+filePathWithoutType+" ->"+stdout)

			soundFilesMetaData[filePathWithoutType] = _.extend(
				soundFilesMetaData[filePathWithoutType],
				{
					length: parseFloat(stdout)
				}
			)

			waitingFor["gettingMetaData"] -= 1

			if( waitingFor["gettingMetaData"] === 0 ) {
				console.log("Finished getting metadata")
				_.each(
					soundFiles,
					processSoundFile
				)
			}
		}
	);
}

function readSetJSONFile( filePath ) {
	var jsonSet = fs.readFileSync(filePath, 'utf-8')
	var parsedJSON = JSON.parse(jsonSet)

	return parsedJSON
}

readSetDir( setPath )
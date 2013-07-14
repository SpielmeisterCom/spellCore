define(
	'spell/shared/build/target/android/AndroidBuilder',
	[
		'spell/shared/build/createBuilderType',
		'spell/shared/build/createDataFileContent',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',
		'spell/shared/build/copyFile',
		'spell/shared/build/copyFiles',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/writeFile',
		'spell/shared/build/spawnChildProcess',
		'spell/shared/util/createModuleId',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'child_process',
		'ff',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf',
        'wrench'
	],
	function(
		createBuilderType,
		createDataFileContent,
		createDebugPath,
		createProjectLibraryFilePaths,
		copyFile,
		copyFiles,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		writeFile,
		spawnChildProcess,
		createModuleId,
		hashModuleId,

		amdHelper,
		child_process,
		ff,
		fs,
		flob,
		mkdirp,
		path,
		rmdir,
        wrench
	) {
		'use strict'

        var ANDROID_TARGET = 'android-15'

		var writeMetaDataFile = function( destinationPath ) {
			writeFile(
				path.join( destinationPath, 'metadata.json' ),
				JSON.stringify( { sprite : false, package : true } )
			)
		}

        function updateActivity(namespace, activity, destDir, next) {
            var activityFile = path.join( destDir, 'src/' + namespace.replace(/\./g, '/') + '/' + activity + '.java')

            if( fs.existsSync( activityFile ) ) {

                fs.readFile( activityFile, 'utf-8', function( err, contents ) {
                    contents = contents
                        .replace(/extends Activity/g, "extends com.tealeaf.TeaLeaf")
                        .replace(/setContentView\(R\.layout\.main\);/g, "startGame();")

                    fs.writeFile( activityFile, contents, next )
                })
            }
        }


        var createXsltProcCliParams = function( XslFile, sourceXmlFile, destinationXmlFile, buildOptions ) {
            var cliParams = [
            ]

            for( var key in buildOptions ) {
                cliParams.push( '--stringparam' )
                cliParams.push( key )
                cliParams.push( buildOptions[ key ] )
            }

            cliParams.push( '--output' )
            cliParams.push( destinationXmlFile )

            cliParams.push( XslFile )
            cliParams.push( sourceXmlFile )

            return cliParams
        }

		var build = function( spellCorePath, projectPath, projectLibraryPath, outputPath, target, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var outputAndroidPath   = path.join( outputPath, 'android' ),
				spellEnginePath     = path.resolve( spellCorePath, '../../../..' ),
                androidSdkPath      = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'android-sdk', 'linux-ia32'),
                JDKPath             = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'jdk', 'linux-ia32'),
                xslFile             = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'native-android', 'AndroidManifest.xsl'),
                tealeafPath         = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'native-android', 'TeaLeaf'),
                androidTool         = path.resolve( androidSdkPath, 'tools', 'android')

//			console.log( 'spellCorePath: ' + spellCorePath )
//			console.log( 'spellEnginePath: ' + spellEnginePath )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// set up temporary android project
			var projectId      = projectConfig.config.projectId,
				tmpProjectPath = path.join( projectPath, 'build', 'tmp', 'android', projectId ),
				resourcesPath  = path.join( tmpProjectPath, 'assets', 'resources' )

			rmdir.sync( tmpProjectPath )
			mkdirp.sync( tmpProjectPath )

            wrench.copyDirSyncRecursive(
                tealeafPath,
                path.join( tmpProjectPath, '..', 'TeaLeaf'),
                {
                    forceDelete: true,
                    preserveFiles: false,
                    inflateSymlinks: false
                }
            )

            var defaultOptions = {
              /*
                 A package name must be constitued of two Java identifiers.
                 Each identifier allowed characters are: a-z A-Z 0-9 _
               */
              'package'         : 'com.spelljs', //namespace,
              'title'           : '', //title
              'activity'        : '.defaultActivity',
              'version'         : '',
              'versionCode'     : '0',
              'gameHash'        : '0.0',
              'sdkHash'         : '1.0',
              'androidHash'     : '1.0',
              'develop'         : String(debug),
              'appid'           : '',
              'shortname'       : 'tealeafX',
              'studioName'      : 'Acme Inc.',
              'codeHost'        : '127.0.0.1',
              'tcpHost'         : '127.0.0.1',
              'codePort'        : '80',
              'tcpPort'         : '4747',
              'entryPoint'      : 'gc.native.launchClient',
              'pushUrl'         : 'http://127.0.0.1/push/%s/?device=%s&amp;version=%s',
              'servicesUrl'     : 'http://127.0.0.1',
              'disableLogs'     : String(!debug),
              'debuggable'      : 'true', //for release set this to false
              'installShortcut' : 'false',
              'contactsUrl'     : '',
              'orientation'    : 'landscape' //landscape, unspecified
            };

            var buildOptions = defaultOptions,
                name = buildOptions[ 'shortname' ],
                activity = ( buildOptions[ 'activity' ].substring(0, 1) == '.' ) ? buildOptions[ 'activity' ].substring( 1 ) : buildOptions[ 'activity' ]

			var f = ff(
				function() {
                    console.log( '[spellcli] Creating temporary android project in ' + tmpProjectPath )

                    spawnChildProcess(
                        androidTool,
                        [
                            'create',       'project',
                            '--target',     ANDROID_TARGET,
                            '--name',       name,
                            '--path',       tmpProjectPath,
                            '--activity',   activity,
                            '--package',    buildOptions[ 'package' ],
                        ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Adding libtealeaf as dependency for the android project' )

                    spawnChildProcess(
                        androidTool,
                        [
                            'update',       'project',
                            '--target',     ANDROID_TARGET,
                            '--path',       tmpProjectPath,
                            '--library',    '../TeaLeaf'
                        ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Patching AndroidManifest.xml file' )

                    var xsltprocParameters = createXsltProcCliParams(
                        xslFile,
                        path.resolve( tealeafPath, 'AndroidManifest.xml'),
                        path.resolve( tmpProjectPath, 'AndroidManifest.xml' ),
                        buildOptions
                    )

                    spawnChildProcess(
                        'xsltproc',
                        xsltprocParameters,
                        {
                            cwd : tmpProjectPath
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Patching ' + activity + '.java' )

                    updateActivity(
                        buildOptions['package'],
                        activity,
                        tmpProjectPath,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Populating the android project with SpellJS project resources' )

                    // copy project library directory
                    var libraryResourcesPath    = path.join( resourcesPath, 'library'),
                        spelljsResourcesPath    = path.join( resourcesPath, 'spelljs' )


                    //copy stage-zero loader for libtealeaf
                    mkdirp.sync( resourcesPath )

                    copyFile(
                        path.join( spellEnginePath, 'modules', 'spellAndroid', 'launchClient.js' ),
                        path.join( resourcesPath, 'native.js.mp3' )
                    )

                    // create application module and engine library file
                    mkdirp.sync( spelljsResourcesPath )

                    writeFile(
						path.join( spelljsResourcesPath, 'data.js.mp3' ),
						createDataFileContent( scriptSource, cacheContent, projectConfig )
					)

					copyFile(
						createDebugPath( debug, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
						path.join( spelljsResourcesPath, 'spell.js.mp3' )
					)

					//writeMetaDataFile( spelljsResourcesPath )

					copyFiles(
						projectLibraryPath,
						libraryResourcesPath,
						createProjectLibraryFilePaths( projectLibraryPath )
					)

					//writeMetaDataFile( libraryResourcesPath )
				},
				function() {
                    console.log( '[spellcli] Running ant in ' + tmpProjectPath + ' to build the android project' )

                    //build the android project
					spawnChildProcess(
                        'ant',
                        [ debug ? 'debug' : 'release' ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
				},
                function() {
                    //sign apk file, if we have keys a and doing a release build

                    f.wait()
                },
				function() {
					// copy generated apk file to output directory

/*					mkdirp.sync( outputAndroidPath )

					copyFile(
						path.join( tmpProjectPath, 'build', 'debug', 'native-android', projectId + '.apk' ),
						path.join( outputAndroidPath, projectId + '.apk' )
					)

					*/

				},
				next
			)
		}

		var TARGET_NAME  = 'android',
			AndroidBuilder = createBuilderType()

		AndroidBuilder.prototype = {
			init : function() {},
			getName : function() {
				return TARGET_NAME
			},
			handlesTarget : function( x ) {
				return x === 'all' ||
					x === TARGET_NAME
			},
			build : function( next ) {
				console.log( 'building for target "' + TARGET_NAME + '"...' )

				build(
					this.spellCorePath,
					this.projectPath,
					this.projectLibraryPath,
					this.outputPath,
					this.target,
					this.projectConfig,
					this.library,
					this.cacheContent,
					this.scriptSource,
					this.minify,
					this.anonymizeModuleIds,
					this.debug,
					next
				)
			}
		}

		return AndroidBuilder
	}
)

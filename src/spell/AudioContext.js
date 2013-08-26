/**
 * The AudioContext provides playing of sound effects.
 *
 * Example:
 *
 *     spell.audioContext.play(
 *         spell.assetManager.get( 'sound:myGame.creakyNoise' ).resource,
 *         'creakyNoise',
 *         0.7,
 *         false
 *     )
 *
 * @class spell.audioContext
 * @singleton
 */
var AudioContext = function() {}

AudioContext.prototype = {
	/**
	 * Returns a AudioResource instance.
	 *
	 * @param {Object} buffer
	 * @return {AudioResource}
	 */
	createSound : function( buffer ) {},

	/**
	 * Returns a configuration object.
	 *
	 * @return {Object}
	 */
	getConfiguration : function() {},

	/**
	 * Mutes the sound specified by the id.
	 *
	 * Example:
	 *
	 *     spell.audioContext.mute( 'creakyNoise' )
	 *
	 * @param {String} id
	 */
	mute : function( id ) {},

	/**
	 * Returns true if the audio context is muted, false otherwise.
	 *
	 * @return {Boolean}
	 */
	isAllMuted : function() {},

	/**
	 * Loads an audio file asynchronously into a buffer.
	 *
	 * @param {String} src the url to the audio file's location
	 * @param {Function} onLoadCallback This function is called after the loading process is finished.
	 */
	loadBuffer : function( src, onLoadCallback ) {},

	/**
	 * Starts playing a sound using the specified audioResource. When an id is provided it can be used to perform additional calls to the playing sound.
	 *
	 * Example:
	 *
	 *     spell.audioContext.play(
	 *         spell.assetManager.get( 'sound:myGame.creakyNoise' ).resource,
	 *         'creakyNoise',
	 *         0.7,
	 *         false
	 *     )
	 *
	 * @param {AudioResource} audioResource
	 * @param {String} id a unique id which identifies the playing sound
	 * @param {Number} volume the volume must be provided in the range [0.0, 1.0]
	 * @param {Boolean} loop if true the sound effect is looped
	 */
	play : function( audioResource, id, volume, loop ) {},

	/**
	 * Sets the audio context's "all muted" state.
	 *
	 * @param isMute If true all currently playing sounds get muted, they get unmuted otherwise.
	 */
	setAllMuted : function( isMute ) {},

	/**
	 * Sets the sound specified by the id to looping.
	 *
	 * Example:
	 *
	 *     spell.audioContext.setLoop( 'creakyNoise', true )
	 *
	 * @param {String} id
	 * @param loop
	 */
	setLoop : function( id, loop ) {},

	/**
	 * Sets the volume of the sound specified by the id.
	 *
	 * Example:
	 *
	 *     spell.audioContext.setVolume( 'creakyNoise', 0.25 )
	 *
	 * @param {String} id
	 * @param volume
	 */
	setVolume : function ( id, volume ) {},

	/**
	 * Stops playing of the sound specified by the id.
	 *
	 * Example:
	 *
	 *     spell.audioContext.stop( 'creakyNoise' )
	 *
	 * @param {String} id
	 */
	stop : function( id ) {},

	/**
	 * The audio context implementes its housekeeping here. Must be called regularly in order to stay tidy.
	 *
	 * @private
	 */
	tick : function() {}
}

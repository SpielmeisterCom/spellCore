/*
 * Underscore.js 1.3.3
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Underscore is freely distributable under the MIT license.
 * Portions of Underscore are inspired or borrowed from Prototype,
 * Oliver Steele's Functional, and John Resig's Micro-Templating.
 * For all details and documentation:
 * http://documentcloud.github.com/underscore
 */

/**
 * @class spell.functions
 * @singleton
 */
define(
	'spell/functions',
	[
		'spell/shared/util/platform/functions'
	],
	function(
		platformImpl
	) {
		var _ = {}

		/**
		 * Is a given value an array?
		 *
		 * @type {*}
		 * @method
		 */
		_.isArray = platformImpl.isArray

		/**
		 * Is a given variable an object?
		 *
		 * @param object
		 * @return {Boolean}
		 */
		_.isObject = platformImpl.isObject

		/**
		 * Return the number of elements in an object.
		 *
		 * @param object
		 * @return {*}
		 */
		_.size = platformImpl.size

		/**
		 * Safely convert anything iterable into a real, live array.
		 *
		 * @param object
		 * @return {*}
		 */
		_.toArray = platformImpl.toArray


		/**
		 * Iterates over a **list** of elements, yielding each in turn to an **iterator** function.
		 * The **iterator** is bound to the **context** object, if one is passed.
		 * Each invocation of **iterator** is called with three arguments:
		 * *(element, index, list)*. If **list** is a JavaScript object,
		 * **iterator**'s arguments will be *(value, key, list)*.
		 *
		 * Example:
		 *     _.each([1, 2, 3], function(num){ alert(num) })
		 *     //=> alerts each number in turn...
		 *     _.each({one : 1, two : 2, three : 3}, function(num, key){ alert(num) })
		 *     //=> alerts each number in turn...
		 *
		 * @param {Array|Object} list An Array or an Object with key/value pairs
		 * @param {Function} iterator Iterator function. The arguments for this function will be *(element, index, list)*
		 * if object is an Array and *(value, key, list)*
		 * @param {Object} [context] The context in which the iterator should be bound to
		 * @returns {void}
		 */
		_.each = platformImpl.each

		/**
		 * Produces a new array of values by mapping each value in **list** through a
		 * transformation function (**iterator**). If **list** is a JavaScript object, **iterator**'s
		 * arguments will be *(value, key, list)*.
		 *
		 * Example:
		 *
		 *     _.map([1, 2, 3], function(num){ return num * 3 })
		 *     //=> [3, 6, 9]
		 *
		 *     _.map({one : 1, two : 2, three : 3}, function(num, key){ return num * 3 })
		 *     //=> [3, 6, 9]
		 *
		 * @param {Array|Object} list An Array or an Object with key/value pairs
		 * @param {Function} iterator Iterator function. The arguments for this function will be *(element, index, list)*
		 * if object is an Array and *(value, key, list)*
		 * @param {Object} [context] The context in which the iterator should be bound to
		 * @returns {Array} Array with the values of **list** mapped through the **iterator** transformation function
		 */
		_.map = platformImpl.map

		/**
		 * Get the last element of an array. Passing **n** will return the last N
		 * values in the array. The **guard** check allows it to work with `_.map`.
		 *
		 * @param array
		 * @param n
		 * @param guard
		 * @return {*}
		 */
		_.last = platformImpl.last

		/**
		 * Return all the elements that pass a truth test
		 *
		 * @param object
		 * @param iterator
		 * @param context
		 * @return {*}
		 */
		_.filter = platformImpl.filter

		/**
		 * Has own property?
		 *
		 * @param object
		 * @param key
		 * @return {*}
		 */
		_.has = platformImpl.has

		/**
		 * Determine if at least one element in the object matches a truth test.
		 *
		 * @param object
		 * @param iterator
		 * @param context
		 * @return {*}
		 */
		_.any = platformImpl.any

		/**
		 * Looks through each value in the **list**, returning the first one that passes a truth test (**iterator**).
		 * The function returns as soon as it finds an acceptable element, and doesn't traverse the entire list.
		 *
		 * Example:
		 *
		 *     var even = _.find([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0 })
		 *     //=> 2
		 *
		 * @param {Array} list
		 * @param {Function} iterator
		 * @param {Object} [context]
		 * @return {*}
		 */
		_.find = platformImpl.find

		/**
		 * Run a function **n** times.
		 *
		 * @param n
		 * @param iterator
		 * @param context
		 */
		_.times = platformImpl.times

		/**
		 * Extend a given object with all the properties in passed-in object(s).
		 *
		 * @param object
		 * @return {*}
		 */
		_.extend = platformImpl.extend

		_.all = platformImpl.all

		/**
		 * Generate an integer Array containing an arithmetic progression. A port of
		 * the native Python `range()` function. See
		 * [the Python documentation](http://docs.python.org/library/functions.html#range).
		 *
		 * @param start
		 * @param stop
		 * @param step
		 * @return {Array}
		 */
		_.range = platformImpl.range

		/**
		 * **reduce** boils down a list of values into a single value.
		 * **memo** is the initial state of the reduction, and each successive step of it should be returned by iterator.
		 *
		 * Example:
		 *
		 *     var sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num }, 0)
		 *     //=> 6
		 *
		 * @param {Array} list An array holding the values over which this functions iterates. Each value will be
		 * passed to the iterator function.
		 * @param {Function} iterator Iterator function which is called with the arguments **(memo, value, index, list)**
		 * @param {Object} [memo] Any object (e.g. a String or Number) that should be passed as initial value
		 * to the iterator function
		 * @param {Object} [context] Context in which the iterator should be called
		 * @return {Object}
		 */
		_.reduce = platformImpl.reduce

		/**
		 * Create a function bound to a given object (assigning `this`, and arguments,
		 * optionally). Binding with arguments is also known as `curry`.
		 *
		 * @param func
		 * @param context
		 * @return {*}
		 */
		_.bind = platformImpl.bind

		/**
		 * Return all the elements for which a truth test fails.
		 *
		 * @param object
		 * @param iterator
		 * @param context
		 * @return {Array}
		 */
		_.reject = platformImpl.reject

		/**
		 * Create a (shallow-cloned) duplicate of an object.
		 *
		 * @param object
		 * @return {*}
		 */
		_.clone = platformImpl.clone

		/**
		 * Fill in a given object with default properties.
		 *
		 * @param object
		 * @return {*}
		 */
		_.defaults = platformImpl.defaults

		/**
		 * If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
		 * we need this function. Return the position of the first occurrence of an
		 * item in an array, or -1 if the item is not included in the array.
		 * If the array is large and already in sort order, pass `true`
		 * for **isSorted** to use binary search.
		 *
		 * @param array
		 * @param item
		 * @param isSorted
		 * @return {*}
		 */
		_.indexOf = platformImpl.indexOf

		/**
		 * Is a given value a string?
		 *
		 * @param object
		 * @return {Boolean}
		 */
		_.isString = platformImpl.isString

		/**
		 * Is a given array, string, or object empty?
		 * An "empty" object has no enumerable own-properties.
		 *
		 * @param object
		 * @return {Boolean}
		 */
		_.isEmpty = platformImpl.isEmpty

		/**
		 * Retrieve the names of an object's properties.
		 *
		 * @type {*}
		 * @method
		 */
		_.keys = platformImpl.keys

		/**
		 * Is a given value a function?
		 *
		 * @param object
		 * @return {Boolean}
		 */
		_.isFunction = platformImpl.isFunction

		/**
		 * Determine if a given value is included in the array or object using `===`.
		 *
		 * @param object
		 * @param target
		 * @return {Boolean}
		 */
		_.contains = platformImpl.contains

		/**
		 * Invoke a method (with arguments) on every item in a collection.
		 *
		 * @param object
		 * @param method
		 * @return {*}
		 */
		_.invoke = platformImpl.invoke

		/**
		 * Return a completely flattened version of an array.
		 *
		 * @param array
		 * @param shallow
		 * @return {*}
		 */
		_.flatten = platformImpl.flatten

		/**
		 * Return a copy of the object only containing the whitelisted properties.
		 *
		 * @param object
		 * @return {Object}
		 */
		_.pick = platformImpl.pick

		/**
		 * Computes the union of the passed-in arrays: the list of unique items, in order, that are present in one or more of the arrays.
		 *
		 * @param array
		 * @return {*}
		 */
		_.union = platformImpl.union

		/**
		 * Similar to without, but returns the values from array that are not present in the other arrays.
		 *
		 * @param array
		 * @param others
		 * @return {*}
		 */
		_.difference = platformImpl.difference

		/**
		 * Return all of the values of the object's properties.
		 *
		 * @param object
		 * @return {Array}
		 */
		_.values = platformImpl.values

		/**
		 * Produces a duplicate-free version of the array, using === to test object equality. If you know in advance that the array is sorted, passing true for
		 * isSorted will run a much faster algorithm. If you want to compute unique items based on a transformation, pass an iterator function.
		 *
		 * @param array
		 * @param {Boolean} [isSorted]
		 * @param {Function} [iterator]
		 * @return {Array}
		 */
		_.unique = platformImpl.unique

		/**
		 * Returns everything but the last entry of the array. Especially useful on the arguments object. Pass n to exclude the last n elements from the result.
		 *
		 * @param array
		 * @param n
		 * @return {Array}
		 */
		_.initial = platformImpl.initial

		/**
		 * A convenient version of what is perhaps the most common use-case for map: extracting a list of property values.
		 *
		 * @param list
		 * @param propertyName
		 * @return {Array}
		 */
		_.pluck = platformImpl.pluck

		/**
		 * Merges together the values of each of the arrays with the values at the corresponding position. Useful when you have separate data sources that
		 * are coordinated through matching array indexes. If you're working with a matrix of nested arrays, zip.apply can transpose the matrix in a similar
		 * fashion.
		 *
		 * @return {Array}
		 */
		_.zip = platformImpl.zip

		return _
	}
)

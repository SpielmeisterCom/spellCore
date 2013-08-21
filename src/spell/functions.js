/**
 * @license
 * @preserve
 *
 * This class is derived from the library "Underscore" which original license follows:
 *
 * Licence Notice Underscore.js 1.3.3:
 *
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * *spell.functions* is a collection of utility functions akin to [underscore js](http://underscorejs.org).
 *
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
		'use strict'


		var _ = {};

		/**
		 * Returns *true* if **object** is an Array.
		 *
		 * Examples:
		 *
		 *     (function(){ return _.isArray(arguments); })();
		 *     //=> false
		 *     _.isArray([1,2,3]);
		 *     => true
		 *
		 * @param {Object} object
		 * @returns {Boolean}
		 */
		_.isArray = platformImpl.isArray;

		/**
		 * Returns *true* if **value** is an Object.
		 *
		 * Examples:
		 *
		 *     _.isObject({});
		 *     //=> true
		 *     _.isObject(1);
		 *     //=> false
		 *
		 * @param {Object} value
		 * @return {Boolean}
		 */
		_.isObject = platformImpl.isObject;

		/**
		 * Return the number of values in the **list**.
		 *
		 * Example:
		 *
		 *     _.size({one : 1, two : 2, three : 3})
		 *     //=> 3
		 *
		 * @param {Object} list
		 * @return {Number}
		 */
		_.size = platformImpl.size;

		/**
		 * Converts the **list** (anything that can be iterated over), into a real Array.
		 * Useful for transmuting the arguments object.
		 *
		 * Example:
		 *
		 *     (function(){ return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
		 *     //=> [2, 3, 4]
		 *
		 * @param {Object} list
		 * @return {Array}
		 */
		_.toArray = platformImpl.toArray;


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
		 * if object is an Array and *(value, key, list)* if it's an Object
		 * @param {Object} [context] The context in which the iterator should be bound to
		 * @returns {void}
		 */
		_.each = platformImpl.each;

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
		 * if object is an Array and *(value, key, list)* if it's an Object
		 * @param {Object} [context] The context in which the iterator should be bound to
		 * @returns {Array} Array with the values of **list** mapped through the **iterator** transformation function
		 */
		_.map = platformImpl.map;

		/**
		 * Returns the last element of an **array**. Passing **n** will return the last n elements of the array.
		 *
		 * Example:
		 *
		 *     _.last([5, 4, 3, 2, 1]);
		 *     //=> 1
		 *
		 * @param {Array} array
		 * @param {Number} [n]
		 * @return {Array|Object}
		 */
		_.last = platformImpl.last;

		/**
		 * Looks through each value in the **list**, returning an array of all the values that pass a
		 * truth test (**iterator**).
		 *
		 * Example:
		 *
		 *     var evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
		 *     //=> [2, 4, 6]
		 *
		 * @param {Array} list
		 * @param {Function} iterator
		 * @param {Object} [context]
		 * @return {Array}
		 */
		_.filter = platformImpl.filter;

		/**
		 * Does the object contain the given key?
		 *
		 * Example:
		 *
		 *     _.has({a: 1, b: 2, c: 3}, "b");
		 *     //=> true
		 *
		 * @param {Object} object
		 * @param {String} key
		 * @return {Boolean}
		 */
		_.has = platformImpl.has;

		/**
		 * Returns *true* if any of the values in the **list** pass the **iterator** truth test.
		 * Short-circuits and stops traversing the list if a *true* element is found.
		 *
		 * Example:
		 *
		 *     _.any([null, 0, 'yes', false], function(value) { return value; });
		 *     //=> true
		 *
		 * @param {Array} object
		 * @param {Function} iterator
		 * @param [context]
		 * @return {Boolean}
		 */
		_.any = platformImpl.any;

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
		 * @return {Object}
		 */
		_.find = platformImpl.find;

		/**
		 * Invokes the given **iterator** function *n* times.
		 *
		 * Example:
		 *
		 *     _.times(3, function(){ genie.grantWish(); });
		 *
		 * @param {Number} n
		 * @param {Function} iterator
		 * @param {Object} [context]
		 */
		_.times = platformImpl.times;

		/**
		 * Copy all of the properties in the **source** objects over to the **destination** object,
		 * and return the **destination** object. It's in-order, so the last source will override
		 * properties of the same name in previous arguments.
		 *
		 * Example:
		 *
		 *     _.extend({name : 'moe'}, {age : 50});
		 *     //=> {name : 'moe', age : 50}
		 *
		 * @param {Object} destination
		 * @param {Object...} sources
		 * @return {Object}
		 */
		_.extend = platformImpl.extend;

		/**
		 * Returns *true* if all of the values in the **list** pass the **iterator** truth test.
		 *
		 * Example:
		 *
		 *     _.all([true, 1, null, 'yes'], function(value) { return value; });
		 *     //=> false
		 *
		 * @param {Array} list
		 * @param {Function} iterator
		 * @param {Object} [context]
		 * @returns {Boolean}
		 */
		_.all = platformImpl.all;

		/**
		 * A function to create flexibly-numbered lists of integers, handy for each and map loops.
		 * Returns a list of integers from **start** to **stop**, incremented (or decremented) by **step**.
		 *
		 * Examples:
		 *
		 *     _.range(10);
		 *     //=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
		 *     _.range(1, 11);
		 *     //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		 *     _.range(0, 30, 5);
		 *     //=> [0, 5, 10, 15, 20, 25]
		 *     _.range(0, -10, -1);
		 *     //=> [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
		 *     _.range(0, 0);
		 *     => []
		 *
		 * @param {Number} start
		 * @param {Number} stop
		 * @param {Number} [step] defaults to 1 of omitted
		 * @return {Array}
		 */
		_.range = platformImpl.range;

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
		_.reduce = platformImpl.reduce;

		/**
		 * Bind a **function** to an **object**, meaning that whenever the function is called,
		 * the value of *this* will be the **object**. Optionally, bind **arguments** to the **function**
		 * to pre-fill them, also known as partial application.
		 *
		 * Example:
		 *
		 *     var func = function(greeting){ return greeting + ': ' + this.name };
		 *     func = _.bind(func, {name : 'moe'}, 'hi');
		 *     func();
		 *     //=> 'hi: moe'
		 *
		 * @param {Function} function
		 * @param {Object} object
		 * @param {Object...} [arguments]
		 * @return {Function}
		 */
		_.bind = platformImpl.bind;

		/**
		 * Returns the values in **list** without the elements that the truth test (**iterator**) passes.
		 * The opposite of {@link #filter}.
		 *
		 * Example:
		 *
		 *     var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
		 *     //=> [1, 3, 5]
		 *
		 * @param {Array} list
		 * @param {Function} iterator
		 * @param {Object} [context]
		 * @return {Array}
		 */
		_.reject = platformImpl.reject;

		/**
		 * Create a shallow-copied clone of the **object**. Any nested objects or arrays will be
		 * copied by reference, not duplicated.
		 *
		 * Example:
		 *
		 *     _.clone({name : 'moe'});
		 *     //=> {name : 'moe'};
		 *
		 * @param {Object} object
		 * @return {Object}
		 */
		_.clone = platformImpl.clone;

		/**
		 * Fill in missing properties in **object** with default values from the **defaults** objects,
		 * and return the object. As soon as the property is filled, further defaults will have no effect.
		 *
		 * Example:
		 *
		 *     var iceCream = {flavor : "chocolate"};
		 *     _.defaults(iceCream, {flavor : "vanilla", sprinkles : "lots"});
		 *     //=> {flavor : "chocolate", sprinkles : "lots"}
		 *
		 *
		 * @param {Object} object
		 * @param {Object...} defaults
		 * @return {Object}
		 */
		_.defaults = platformImpl.defaults;

		/**
		 * Returns the index at which **value** can be found in the **array**, or -1 if value is not present
		 * in the **array**.  If you're working with a large array, and you know that the array is already
		 * sorted, pass *true* for **isSorted** to use a faster binary search.
		 *
		 * Example:
		 *
		 *     _.indexOf([1, 2, 3], 2);
		 *     //=> 1
		 *
		 * @param {Array} array
		 * @param {Object} value
		 * @param {Boolean} [isSorted]
		 * @return {Number}
		 */
		_.indexOf = platformImpl.indexOf;

		/**
		 * Returns true if object is a String.
		 *
		 *     _.isString("moe");
		 *     //=> true
		 *
		 * @param {Object} object
		 * @return {Boolean}
		 */
		_.isString = platformImpl.isString;

		/**
		 * Returns *true* if **object** contains no values.
		 *
		 * Example:
		 *
		 *     _.isEmpty([1, 2, 3]);
		 *     //=> false
		 *     _.isEmpty({});
		 *     //=> true
         *
		 * @param {Object} object
		 * @return {Boolean}
		 */
		_.isEmpty = platformImpl.isEmpty;

		/**
		 * Retrieve all the names of the **object**'s properties.
		 *
		 * Example:
		 *
		 *     _.keys({one : 1, two : 2, three : 3});
		 *     //=> ["one", "two", "three"]
		 *
		 * @param {Object} object
		 * @returns {Array}
		 */
		_.keys = platformImpl.keys;

		/**
		 * Returns true if object is a Function.
		 *
		 * Example:
		 *
		 *     _.isFunction(alert);
		 *     //=> true
		 *
		 * @param {Object} object
		 * @return {Boolean}
		 */
		_.isFunction = platformImpl.isFunction;

		/**
		 * Returns *true* if the **value** is present in the **list**, using === to test equality.
		 *
		 * Example:
		 *
		 *     _.contains([1, 2, 3], 3);
		 *     //=> true
		 *
		 * @param {Array} list
		 * @param {Object} value
		 * @return {Boolean}
		 */
		_.contains = platformImpl.contains;

		/**
		 * Calls the method named by **methodName** on each value in the list. Any extra **arguments**
		 * passed to invoke will be forwarded on to the method invocation.
		 *
		 * Example:
		 *
		 *     _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
		 *     //=> [[1, 5, 7], [1, 2, 3]]
		 *
		 * @param {Array} list
		 * @param {String} methodName
		 * @param {Object...} arguments
		 * @return {Array}
		 */
		_.invoke = platformImpl.invoke;

		/**
		 * Flattens a nested **array** (the nesting can be to any depth). If you pass **shallow**,
		 * the array will only be flattened a single level.
		 *
		 * Examples:
		 *
		 *     _.flatten([1, [2], [3, [[4]]]]);
		 *     //=> [1, 2, 3, 4];
		 *
		 *     _.flatten([1, [2], [3, [[4]]]], true);
		 *     //=> [1, 2, 3, [[4]]];
		 *
		 * @param {Array} array
		 * @param {Boolean} shallow
		 * @return {Array}
		 */
		_.flatten = platformImpl.flatten;

		/**
		 * Return a copy of the **object**, filtered to only have values for the whitelisted keys specified in **keys**.
		 *
		 * Example:
		 *
		 *     _.pick({name : 'moe', age: 50, userid : 'moe1'}, ['name', 'age']);
		 *     //=> {name : 'moe', age : 50}
		 *
		 * @param {Object} object
		 * @param {Array} keys Array containing the keys for the whitelist in **object**
		 * @return {Object}
		 */
		_.pick = platformImpl.pick;

		/**
		 * Computes the union of the passed-in **arrays**: the list of unique items, in order,
		 * that are present in one or more of the **arrays**.
		 *
		 * Example:
		 *
		 *     _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
		 *     //=> [1, 2, 3, 101, 10]
		 *
		 * @param {Array...} arrays
		 * @return {Array}
		 */
		_.union = platformImpl.union;

		/**
		 * Returns the values from **array** that are not present in the **other** arrays.
		 *
		 * Example:
		 *
		 *     _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
		 *     //=> [1, 3, 4]
		 *
		 * @param {Array} array
		 * @param {Array...} others
		 * @return {Array}
		 */
		_.difference = platformImpl.difference;

		/**
		 * Return all of the values of the **object**'s properties.
		 *
		 * Example:
		 *
		 *     _.values({one : 1, two : 2, three : 3});
		 *     //=> [1, 2, 3]
		 *
		 * @param {Object} object
		 * @return {Array}
		 */
		_.values = platformImpl.values;

		/**
		 * Produces a duplicate-free version of the **array**, using === to test object equality.
		 * If you know in advance that the array is sorted, passing *true* for **isSorted** will run a much faster
		 * algorithm.
		 *
		 * Example:
		 *     _.uniq([1, 2, 1, 3, 1, 4]);
		 *     //=> [1, 2, 3, 4]
		 *
		 * @param {Array} array
		 * @param {Boolean} [isSorted]
		 * @return {Array}
		 */
		_.unique = platformImpl.unique;

		/**
		 * Returns everything but the last entry of the **array**.
		 * Especially useful on the arguments object. Pass **n** to exclude the last n elements from the result.
		 *
		 * Example:
		 *
		 *     _.initial([5, 4, 3, 2, 1]);
		 *     //=> [5, 4, 3, 2]
		 *
		 * @param {Array} array
		 * @param {Number} [n] Exclude the last n elments from the result
		 * @return {Array}
		 */
		_.initial = platformImpl.initial;

		/**
		 * A convenient version of what is perhaps the most common use-case for {@link #map}:
		 * extracting a list of property values.
		 *
		 * Example:
		 *
		 *     var stooges = [{name : 'moe', age : 40}, {name : 'larry', age : 50}, {name : 'curly', age : 60}];
		 *     _.pluck(stooges, 'name');
		 *     //=> ["moe", "larry", "curly"]
		 *
		 * @param {Array} list Array with associative arrays in it
		 * @param {String|Number} propertyName key that will be used to lookup the value in the elements of **list**
		 * @return {Array}
		 */
		_.pluck = platformImpl.pluck;

		/**
		 * Merges together the values of each of the **arrays** with the values at the corresponding position.
		 * Useful when you have separate data sources that are coordinated through matching array indexes.
		 *
		 * Example:
		 *
		 *     _.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]);
		 *     //=> [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
		 *
		 * @param {Array...} arrays
		 * @return {Array}
		 */
		_.zip = platformImpl.zip;

		/**
		 * Creates a version of the function that will only be run after first being called count times. Useful for
		 * grouping asynchronous responses, where you want to be sure that all the async calls have finished, before
		 * proceeding.
		 *
		 * Example:
		 *
		 *     var lock = _.after( 3, function() { // resuming with doing stuff after third call to "lock" function } )
		 *
		 * @param {Number} count The count after which the callback function is called.
		 * @param {Function} function The callback function to call after the **count** times.
		 */
		_.after = platformImpl.after;

		/**
		 * Computes the list of values that are the intersection of all the arrays. Each value in the result is present in each of the arrays.
		 *
		 * Example:
		 *
		 *     _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
		 *     //=> [1, 2]
		 *
		 * @param {Array...} arrays
		 * @return {Array}
		 */
		_.intersection = platformImpl.intersection;

		/**
		 * Returns true if object is NaN.
		 * Note: this is not the same as the native isNaN function, which will also return true if the variable is undefined.
		 *
		 * @param {Object} Number
		 */
		_.isNaN = platformImpl.isNaN;

		/**
		 * Returns the same value that is used as the argument. In math: f(x) = x
		 * This function looks useless, but is used throughout Underscore as a default iterator.
		 *
		 *     var moe = {name : 'moe'};
		 *     moe === _.identity(moe);
		 *     //=> true
		 */
		_.identity = platformImpl.identity;

		return _
	}
)

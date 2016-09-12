var _ = require('underscore');

/**
 * Return the first element of the array
 * @param array
 * @param obj
 * @returns {null}
 */
var first = function (array) {
    return _.first(array) || null;
};

/**
 * Return the obj from array if exists or null
 * @param array
 * @param obj
 * @returns {*}
 */
var get = function (array, obj) {
    var index = array.indexOf(obj);
    if (index > -1) {
        return array[index];
    }
    return null;
};

/**
 * Add an object to the end of the array
 * @param array
 * @param obj
 */
var add = function (array, obj) {
    array.push(obj);
};

/**
 * Remove an object from the array
 * @param array
 * @param obj
 */
var remove = function (array, obj) {
    var index = array.indexOf(obj);
    if (index > -1) {
        array.splice(index, 1);
    }
};

/**
 * Set the next element of the array (first will be last and second will be first)
 * @param array
 * @param obj
 */
var next = function (array, obj) {
    var first = first(array);
    var firstClone = _.clone(first);
    remove(array, first);
    array.push(firstClone);
};

module.exports = {
    first: first,
    get: get,
    add: add,
    remove: remove,
    next: next
};
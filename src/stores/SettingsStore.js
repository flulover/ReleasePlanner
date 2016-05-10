/**
 *
 * Created by yzzhou on 5/11/16.
 */
var Dispatcher = require('../dispatcher/dispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../constants/constants');

var SettingsStore = Assign({}, EventEmitter.prototype, {
    developerCount: 0,
    velocity: 0,
    iterationLength: 0,
    changeDeveloperCount: function (developerCount) {
        this.developerCount = developerCount;
        this.emitChange();
    },
    changeVelocity: function (velocity) {
        this.velocity = velocity;
        this.emitChange();
    },
    changeIterationLength: function (iterationLength) {
        this.iterationLength = iterationLength;
        this.emitChange();
    },
    addChangeListener: function (callback) {
        this.on(Constant.SETTING_CHANGE, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(Constant.SETTING_CHANGE, callback);
    },
    emitChange: function () {
        this.emit(Constant.SETTING_CHANGE);
    },
    getSettings: function () {
       return {
           developerCount: this.developerCount,
           velocity: this.velocity,
           iterationLength: this.iterationLength
       }
    }
});

Dispatcher.register(function (action) {
    var actionMap = {
        'SETTING_CHANGE_DEVELOPER_COUNT': SettingsStore.changeDeveloperCount,
        'SETTING_CHANGE_VELOCITY': SettingsStore.changeVelocity,
        'SETTING_CHANGE_ITERATION_LENGTH': SettingsStore.changeIterationLength
    };

    var mapFunc = actionMap[action.type];
    if (mapFunc){
        mapFunc(action.value);
    }
});

module.exports = SettingsStore;
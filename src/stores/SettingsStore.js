/**
 *
 * Created by yzzhou on 5/11/16.
 */
var Dispatcher = require('../dispatcher/dispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../constants/constants');

var _settings = {
    developerCount: 0,
    velocity: 0,
    iterationLength: 0
};

var _loadSettings = function () {
    var Settings = AV.Object.extend('Settings');
    var query = new AV.Query(Settings);
    query.find().then(function(results) {
        var settings = results[0];
        _settings.developerCount = settings.get('developerCount'),
        _settings.velocity = settings.get('velocity'),
        _settings.iterationLength = settings.get('iterationLength')

        SettingsStore.emitChange();
    }, function(error) {
        console.log('Error: ' + error.code + ' ' + error.message);
    });
};

function _createNewSettings () {
    var Settings = AV.Object.extend('Settings');
    var settings = new Settings();
    settings.set('developerCount', _settings.developerCount);
    settings.set('velocity', _settings.velocity);
    settings.set('iterationLength', _settings.iterationLength);
    settings.save().then(function (settings) {
        console.log('New object created with objectId: ' + settings.id);
    }, function (err) {
        console.log('Failed to create new object, with error message: ' + err.message);
    });
}

function _updateSettings(settings) {
    var Settings = AV.Object.extend('Settings');
    var query = new AV.Query(Settings);
    query.get(settings.id).then(function (settings) {
        settings.set('developerCount', _settings.developerCount);
        settings.set('velocity', _settings.velocity);
        settings.set('iterationLength', _settings.iterationLength);
        settings.save().then(function (settings) {
            console.log('Update object with objectId: ' + settings.id);
        }, function (err) {
            console.log('Failed to update object, with error message: ' + err.message);
        });
    }, function (error) {
        console.log('Error: ' + error.code + ' ' + error.message);
    });
}

function _saveSettings() {
    var Settings = AV.Object.extend('Settings');
    var query = new AV.Query(Settings);
    var self = this;
    query.find().then(function(results) {
        if (results.length == 0){
            _createNewSettings();
        }
        else {
            _updateSettings(results[0]);
        }
    }, function(error) {
        console.log('Error: ' + error.code + ' ' + error.message);
    });
}

var SettingsStore = Assign({}, EventEmitter.prototype, {
    changeDeveloperCount: function (developerCount) {
        _settings.developerCount = developerCount;
        _saveSettings();
        SettingsStore.emitChange();
    },
    changeVelocity: function (velocity) {
        _settings.velocity = velocity;
        _saveSettings();
        SettingsStore.emitChange();
    },
    changeIterationLength: function (iterationLength) {
        _settings.iterationLength = iterationLength;
        _saveSettings();
        SettingsStore.emitChange();
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
        return _settings;
    },
    loadSettings(){
        _loadSettings();
    }
});

Dispatcher.register(function (action) {
    var actionMap = {
        'SETTING_CHANGE_DEVELOPER_COUNT': SettingsStore.changeDeveloperCount,
        'SETTING_CHANGE_VELOCITY': SettingsStore.changeVelocity,
        'SETTING_CHANGE_ITERATION_LENGTH': SettingsStore.changeIterationLength,
        'SETTING_LOAD': SettingsStore.loadSettings,
    };

    var mapFunc = actionMap[action.type];
    if (mapFunc){
        mapFunc(action.value);
    }
});

module.exports = SettingsStore;
/**
 *
 * Created by yzzhou on 5/11/16.
 */
import Dispatcher from '../dispatcher/dispatcher';
import Assign from 'object-assign';
import { EventEmitter } from 'events';
import Constant from '../constants/constants';
import ActionFactory from '../actions/ActionFactory';


var _settings = {
    developerCount: 0,
    velocity: 0,
    iterationLength: 0
};

var _loadSettings = function () {
    var Settings = AV.Object.extend('Settings');
    var query = new AV.Query(Settings);
    query.find().then(function([settings]) {
        _settings.developerCount = settings.get('developerCount'),
        _settings.velocity = settings.get('velocity'),
        _settings.iterationLength = settings.get('iterationLength')

        SettingsStore.emitChange();
        ActionFactory.loadReleasePlans();

    }, function(error) {
        console.log('Error: ' + error.code + ' ' + error.message);
    });
};

_loadSettings();

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
    changeDeveloperCount(developerCount) {
        _settings.developerCount = developerCount;
        _saveSettings();
        SettingsStore.emitChange();
    },
    changeVelocity(velocity) {
        _settings.velocity = velocity;
        _saveSettings();
        SettingsStore.emitChange();
    },
    changeIterationLength(iterationLength) {
        _settings.iterationLength = iterationLength;
        _saveSettings();
        SettingsStore.emitChange();
    },
    addChangeListener(callback) {
        this.on(Constant.SETTING_CHANGE, callback);
    },
    removeChangeListener(callback) {
        this.removeListener(Constant.SETTING_CHANGE, callback);
    },
    emitChange() {
        this.emit(Constant.SETTING_CHANGE);
    },
    getSettings() {
        return _settings;
    },
});

Dispatcher.register(function (action) {
    var actionMap = {
        'SETTING_CHANGE_DEVELOPER_COUNT': SettingsStore.changeDeveloperCount,
        'SETTING_CHANGE_VELOCITY': SettingsStore.changeVelocity,
        'SETTING_CHANGE_ITERATION_LENGTH': SettingsStore.changeIterationLength,
    };

    var mapFunc = actionMap[action.type];
    if (mapFunc){
        mapFunc(action.value);
    }
});

module.exports = SettingsStore;
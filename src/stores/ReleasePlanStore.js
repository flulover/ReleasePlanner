/**
 *
 * Created by yzzhou on 5/11/16.
 */

import Dispatcher from '../dispatcher/dispatcher';
import Assign from 'object-assign';
import { EventEmitter } from 'events';
import Constant from '../constants/constants';
import ReleaePlanCalculator from './ReleasePlanCalculator';

var _rawReleasePlanList = [];


function _addReleasePlan(release) {
    let Release = AV.Object.extend('Release');
    let releaseAV = new Release(release);
    releaseAV.save().then((release) => {
        _rawReleasePlanList.push(release);
        ReleasePlanStore.emitChange();
    });
}

var ReleasePlanStore = Assign({}, EventEmitter.prototype, {
    loadReleasePlans() {
        var Release = AV.Object.extend('Release');
        var query = new AV.Query(Release);
        query.find().then(function(results) {
            if (results.length == 0){
                return;
            }
            _rawReleasePlanList = results;
            ReleasePlanStore.emitChange();
        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    getReleaseList() {
        return ReleaePlanCalculator.calculateReleasePlan(_rawReleasePlanList);
    },
    addChangeListener(callback) {
        this.on(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    removeChangeListener(callback) {
        this.removeListener(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    emitChange() {
        this.emit(Constant.RELEASE_PLAN_CHANGE);
    }
});

Dispatcher.register(function (action) {
    var actionMap = {
        'RELEASE_PLAN_LOAD': ReleasePlanStore.loadReleasePlans,
        'RELEASE_PLAN_ADD': _addReleasePlan,
    };

    var mapFunc = actionMap[action.type];
    if (mapFunc){
        mapFunc(action.value);
    }
});

module.exports = ReleasePlanStore;

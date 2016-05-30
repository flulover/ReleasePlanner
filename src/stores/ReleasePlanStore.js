/**
 *
 * Created by yzzhou on 5/11/16.
 */

import Dispatcher from "../dispatcher/dispatcher";
import Assign from "object-assign";
import {EventEmitter} from "events";
import Constant from "../constants/constants";
import ReleaePlanCalculator from "./ReleasePlanCalculator";
import Util from "../util/Util";

var _releasePlanList = [];


function _addReleasePlan(release) {
    let Release = AV.Object.extend('Release');
    let releaseAV = new Release(release);
    releaseAV.save().then((rawReleaseData) => {
        _releasePlanList.push(Util.toJSON(rawReleaseData));
        ReleasePlanStore.emitChange();
    });
}

function _updateReleasePlan(releasePlan) {
    let Release = AV.Object.extend('Release');
    let query = new AV.Query(Release);
    query.get(releasePlan.objectId).then(function(rawReleasePlan){
        rawReleasePlan.set('name', releasePlan.name);
        rawReleasePlan.set('scope', releasePlan.scope);
        rawReleasePlan.set('startDate', releasePlan.startDate);
        rawReleasePlan.set('adjustFunc', releasePlan.adjustFunc);
        rawReleasePlan.set('regressionIterations', releasePlan.regressionIterations);
        rawReleasePlan.set('buffer', releasePlan.buffer);
        rawReleasePlan.set('factList', releasePlan.factList);

        rawReleasePlan.save().then(function(){
            ReleasePlanStore.emitChange();
        });
    });
}

function _editReleasePlan(releaseIndex) {
    ReleasePlanStore.emitEditReleasePlan(_releasePlanList[releaseIndex]);
}

var ReleasePlanStore = Assign({}, EventEmitter.prototype, {
    loadReleasePlans() {
        var Release = AV.Object.extend('Release');
        var query = new AV.Query(Release);
        query.addAscending('createdAt');
        query.find().then(function(rawReleasePlans) {
            if (rawReleasePlans.length == 0){
                return;
            }
            
            for (let i = 0; i < rawReleasePlans.length; ++i){
                _releasePlanList.push(Util.toJSON(rawReleasePlans[i]));
            }

            ReleasePlanStore.emitChange();
        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    getReleaseList() {
        return ReleaePlanCalculator.calculateReleasePlan(_releasePlanList);
    },
    addChangeListener(callback) {
        this.on(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    removeChangeListener(callback) {
        this.removeListener(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    emitChange() {
        this.emit(Constant.RELEASE_PLAN_CHANGE);
    },
    addEditReleasePlanListener(callback) {
        this.on(Constant.RELEASE_PLAN_EDIT, callback);
    },
    removeEditReleasePlanListener(callback) {
        this.removeListener(Constant.RELEASE_PLAN_EDIT, callback);
    },
    emitEditReleasePlan(editingReleasePlan) {
        this.emit(Constant.RELEASE_PLAN_EDIT, editingReleasePlan);
    }
});

Dispatcher.register(function (action) {
    var actionMap = {
        'RELEASE_PLAN_LOAD': ReleasePlanStore.loadReleasePlans,
        'RELEASE_PLAN_ADD': _addReleasePlan,
        'RELEASE_PLAN_EDIT': _editReleasePlan,
        'RELEASE_PLAN_UPDATE': _updateReleasePlan,
    };

    var mapFunc = actionMap[action.type];
    if (mapFunc){
        mapFunc(action.value);
    }
});

module.exports = ReleasePlanStore;

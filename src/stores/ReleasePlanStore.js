/**
 *
 * Created by yzzhou on 5/11/16.
 */

var Dispatcher = require('../dispatcher/dispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Util = require('../util/util');
var Constant = require('../constants/constants');
var SettingsStore = require('./SettingsStore');

var _rawReleasePlanList = [];

function _getIterationLength(){
    return SettingsStore.getSettings().iterationLength;
}

function _getVelocity() {
    return SettingsStore.getSettings().velocity;
}

function _getDaysInOneIteration() {
    return _getIterationLength() * 7;
}

function _getAdjustFunc(adjustWay) {
    if (adjustWay === ''
        || adjustWay === undefined) {
        return Math.ceil;
    }

    var justReturn = function (iterationLength) {
        return iterationLength;
    };

    var roundToHalf = function (iterationLength) {
        return Math.floor(iterationLength) + 0.5;
    };

    var map = {
        Ceil: Math.ceil,
        RoundToHalf: roundToHalf,
        Actually: justReturn
    };

    return map[adjustWay];
}

function _getVelocityForOneDay() {
    var workDayInOneIteration = _getDaysInOneIteration()*5/7;
    return _getVelocity() / workDayInOneIteration;
}

function _getImpactedPoint(release) {
    var factList = release.get('factList');
    var impactedPoints = 0;
    for(var i = 0; i < factList.length; ++i){
        var fact = factList[i];
        if (fact.type === 'other'){
            impactedPoints += parseInt(factList[i].impactedPoints);
        }else if (fact.type === 'publicHoliday' ){
            if (parseInt(fact.customImpactedPoints)){
                fact.impactedPoints = parseInt(fact.customImpactedPoints);
                impactedPoints += fact.impactedPoints;
            }else{
                var velocityForOneDay = _getVelocityForOneDay();
                var diffDays = Util.getDiffDays(new Date(fact['startDate']), new Date(fact['endDate']));
                fact.impactedPoints = Math.ceil(diffDays * velocityForOneDay);
                impactedPoints += fact.impactedPoints;
            }
        }
    }

    return impactedPoints
}

function _calculateDevelopmentIterationCount(release){
    var velocity = _getVelocity();
    var adjustFunc = _getAdjustFunc(release.get('wayToCalculateDevelopmentIteration'));
    var idealDevelopmentIterations = adjustFunc(release.get('scope') / velocity);
    var lastIterationPoints = release.get('scope') - (idealDevelopmentIterations - 1) * velocity;
    var impactedPoints = _getImpactedPoint(release);

    var tailIterationCount = adjustFunc((lastIterationPoints + impactedPoints*-1) / velocity);
    return idealDevelopmentIterations - 1 + tailIterationCount;
}

function _calculateReleasePlanForOneRelease(release, startDate, delayedDays) {
    var developmentIterationCount = _calculateDevelopmentIterationCount(release);
    release.set('developmentIterations', developmentIterationCount);

    var daysInOneIteration = _getDaysInOneIteration();
    var daysInThisRelease = daysInOneIteration * developmentIterationCount;
    var daysInRegressionTest = release.get('regressionIterations') * daysInOneIteration;
    var bestReleaseDate = startDate;
    bestReleaseDate.setDate(bestReleaseDate.getDate() + daysInThisRelease + daysInRegressionTest);
    release.set('bestReleaseDate', bestReleaseDate.toDateString());

    var worstReleaseDate = bestReleaseDate;
    worstReleaseDate.setDate(bestReleaseDate.getDate() + delayedDays);
    release.set('worstReleaseDate', worstReleaseDate.toDateString());

    return release;
}

function _calculateReleasePlan(rawReleaseList) {
    var firstRelease = rawReleaseList[0];
    var firstStartDate = _adjustStartDate(new Date(firstRelease.get('startDate')));
    var bufferByDay = firstRelease.get('buffer') * _getDaysInOneIteration();
    var releaseList = [];
    releaseList.push(_calculateReleasePlanForOneRelease(firstRelease, firstStartDate, bufferByDay));

    for(let i = 1; i < rawReleaseList.length; ++i){
        var release = rawReleaseList[i];
        var lastReleaseDate = new Date(releaseList[i - 1].get('bestReleaseDate'));
        var startDate = lastReleaseDate;
        startDate.setDate(lastReleaseDate.getDate() + 1);
        startDate = _adjustStartDate(startDate);

        var mayDelayDay = 0;
        for (let j = 0; j < rawReleaseList.length; ++j){
            mayDelayDay += rawReleaseList[j].get('buffer') * _getDaysInOneIteration();
        }
        releaseList.push(_calculateReleasePlanForOneRelease(release, startDate, mayDelayDay));
    }
    return releaseList;
}

function _adjustStartDate(date) {
    var adjustStartDate = new Date(date);
    var weekdaySequence = date.getDay();
    adjustStartDate.setDate(date.getDate() + 4 - weekdaySequence);
    return adjustStartDate;
}

function _addReleasePlan(release) {
    _rawReleasePlanList.push(release);
    ReleasePlanStore.emitChange();
}

var ReleasePlanStore = Assign({}, EventEmitter.prototype, {
    loadReleasePlans: function () {
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
    getReleaseList: function () {
        return _calculateReleasePlan(_rawReleasePlanList);
    },
    addChangeListener: function (callback) {
        this.on(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    removeChangeListener: function (callback) {
        this.removeListener(Constant.RELEASE_PLAN_CHANGE, callback);
    },
    emitChange: function () {
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

/**
 *
 * Created by yzzhou on 5/11/16.
 */

var Dispatcher = require('../dispatcher/dispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Constant = require('../constants/constants');
var SettingsStore = require('./SettingsStore');

var _releasePlanList = [];

function _getIterationLength(){
    var settings = SettingsStore.getSettings();
    return settings.iterationLength;
}

function _getVelocity() {
    var settings = SettingsStore.getSettings();
    return settings.velocity;
}

function _getIterationLengthByDay() {
    return _getIterationLength() * 7;
}

function _getWayToCalculateDevelopmentIterationFunc(wayToCalculateDevelopmentIteration) {
    if (wayToCalculateDevelopmentIteration === ''
        || wayToCalculateDevelopmentIteration === undefined) {
        return Math.ceil;
    }

    var justReturn = function (iterationLength) {
        return iterationLength;
    };

    var roundToHalf = function (iterationLength) {
        var integerPart = Math.floor(iterationLength);
        return integerPart + 0.5;
    };

    var map = {
        Ceil: Math.ceil,
        RoundToHalf: roundToHalf,
        Actually: justReturn
    };

    return map[wayToCalculateDevelopmentIteration];
}

function _getVelocityForOneDay() {
    var workDayForeachIteration = _getIterationLengthByDay()*5/7;

    var settings = SettingsStore.getSettings();
    var velocityForOneDay = settings.velocity / workDayForeachIteration;
    return velocityForOneDay;
}

function _getDiffDays(startDate, endDate) {
    var oneDay = 24*60*60*1000;
    return Math.round(Math.abs((endDate.getTime() - startDate.getTime())/(oneDay)));
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
                var diffDays = _getDiffDays(new Date(fact['startDate']), new Date(fact['endDate']));
                fact.impactedPoints = Math.ceil(diffDays * velocityForOneDay);
                impactedPoints += fact.impactedPoints;
            }
        }
    }

    return impactedPoints
}

function _calculateReleasePlanForOneRelease(release, startDate, mayDelayDay) {
    var velocity = _getVelocity();
    var wayToCalculateDevelopmentIterationFunc = _getWayToCalculateDevelopmentIterationFunc(release.get('wayToCalculateDevelopmentIteration'));
    var idealDevelopmentIterations = wayToCalculateDevelopmentIterationFunc(release.get('scope') / velocity);
    var iterationLengthByDay = _getIterationLengthByDay();
    var lastIterationPoints = release.get('scope') - (idealDevelopmentIterations - 1) * velocity;
    var impactedPoints = _getImpactedPoint(release);

    var tailIterationCount = wayToCalculateDevelopmentIterationFunc((lastIterationPoints + impactedPoints*-1) / velocity);
    var actualDevelopmentIterationCount = idealDevelopmentIterations - 1 + tailIterationCount;
    release.set('developmentIterations', actualDevelopmentIterationCount);

    var developmentLengthByDay = iterationLengthByDay * actualDevelopmentIterationCount;
    var regressionIterationByDay = release.get('regressionIterations') * iterationLengthByDay;

    var bestReleaseDate = startDate;

    bestReleaseDate.setDate(bestReleaseDate.getDate() + developmentLengthByDay + regressionIterationByDay);
    release.set('bestReleaseDate', bestReleaseDate.toDateString());

    var worstReleaseDate = bestReleaseDate;
    worstReleaseDate.setDate(bestReleaseDate.getDate() + mayDelayDay);
    release.set('worstReleaseDate', worstReleaseDate.toDateString());

    return release;
}

function _calculateReleasePlan(rawReleaseList) {
    var firstRelease = rawReleaseList[0];
    var firstStartDate = _adjustStartDate(new Date(firstRelease.get('startDate')));
    var bufferByDay = firstRelease.get('buffer') * _getIterationLengthByDay();
    var releaseList = [];
    releaseList.push(_calculateReleasePlanForOneRelease(firstRelease, firstStartDate, bufferByDay));

    for(var i = 1; i < rawReleaseList.length; ++i){
        var release = rawReleaseList[i];
        var lastReleaseDate = new Date(releaseList[i - 1].get('bestReleaseDate'));
        var startDate = lastReleaseDate;
        startDate.setDate(lastReleaseDate.getDate() + 1);
        startDate = _adjustStartDate(startDate);

        var mayDelayDay = 0;
        for (var j = 0; j < rawReleaseList.length; ++j){
            mayDelayDay += rawReleaseList[j].get('buffer') * _getIterationLengthByDay();
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
    _releasePlanList.push(release);
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
            _releasePlanList = results;
            ReleasePlanStore.emitChange();
        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    getReleaseList: function () {
        var releasePlanList = _calculateReleasePlan(_releasePlanList)
        return releasePlanList;
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

/**
 *
 * Created by yzzhou on 5/15/16.
 */
import SettingsStore from './SettingsStore';
import Util from '../util/Util';

function _getIterationLength(){
    return SettingsStore.getSettings().iterationLength;
}

function _getVelocity() {
    return SettingsStore.getSettings().velocity;
}

function _getDeveloperCount() {
    return SettingsStore.getSettings().developerCount;
}

function _getDaysInOneIteration() {
    return _getIterationLength() * 7;
}

function _getAdjustFunc(adjustWay) {
    if (adjustWay === '' || adjustWay === undefined) {
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
    var factList = release['factList'];
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
                let overlayDateRange = Util.getOverlapDateRange(release['startDate'],
                    new Date(fact['endDate']),
                    new Date(fact['startDate']),
                    new Date(fact['endDate'])
                );
                const diffWorkDays = Util.getDiffWorkDays(overlayDateRange.startDate, overlayDateRange.endDate);
                fact.impactedPoints = Math.ceil(diffWorkDays * _getVelocityForOneDay());
                impactedPoints += fact.impactedPoints;
            }
        }else if (fact.type === 'personalLeave'){
            if (parseInt(fact.customImpactedPoints)){
                fact.impactedPoints = parseInt(fact.customImpactedPoints);
                impactedPoints += fact.impactedPoints;
            }else{
                let overlayDateRange = Util.getOverlapDateRange(release['startDate'],
                    new Date(fact['endDate']),
                    new Date(fact['startDate']),
                    new Date(fact['endDate'])
                );
                const diffWorkDays = Util.getDiffWorkDays(overlayDateRange.startDate, overlayDateRange.endDate);
                const velocityForOnePersonADay = _getVelocityForOneDay() / _getDeveloperCount();
                fact.impactedPoints = Math.ceil(diffWorkDays * velocityForOnePersonADay);
                impactedPoints += fact.impactedPoints;
            }
        }
    }

    return impactedPoints
}

function _calculateDevelopmentIterationCount(release){
    var adjustFunc = _getAdjustFunc(release['adjustFunc']);
    return adjustFunc((parseInt(release['scope']) + _getImpactedPoint(release)) / _getVelocity());
}

function _calculateReleasePlanForOneRelease(release, startDate, delayedDays) {
    release['startDate'] = startDate;

    var developmentIterationCount = _calculateDevelopmentIterationCount(release);
    release['developmentIterations'] = developmentIterationCount;

    var daysInOneIteration = _getDaysInOneIteration();
    var daysInThisRelease = daysInOneIteration * developmentIterationCount;
    var daysInRegressionTest = release['regressionIterations'] * daysInOneIteration;
    var bestReleaseDate = new Date(startDate);
    bestReleaseDate.setDate(bestReleaseDate.getDate() + daysInThisRelease + daysInRegressionTest);
    release['bestReleaseDate'] = bestReleaseDate.toDateString();

    var worstReleaseDate = bestReleaseDate;
    worstReleaseDate.setDate(bestReleaseDate.getDate() + delayedDays);
    release['worstReleaseDate'] = worstReleaseDate.toDateString();

    return release;
}

function calculateReleasePlan(releasePlanList) {
    if (releasePlanList.length === 0){
        return [];
    }

    var firstRelease = releasePlanList[0];
    var firstStartDate = _adjustStartDate(new Date(firstRelease['startDate']));
    var bufferByDay = firstRelease['buffer'] * _getDaysInOneIteration();
    var releaseList = [];
    releaseList.push(_calculateReleasePlanForOneRelease(firstRelease, firstStartDate, bufferByDay));

    for(let i = 1; i < releasePlanList.length; ++i){
        var release = releasePlanList[i];
        var lastReleaseDate = new Date(releaseList[i - 1]['bestReleaseDate']);
        var startDate = lastReleaseDate;
        startDate.setDate(lastReleaseDate.getDate() + 1);
        startDate = _adjustStartDate(startDate);

        var mayDelayDay = 0;
        for (let j = 0; j < releasePlanList.length; ++j){
            mayDelayDay += releasePlanList[j]['buffer'] * _getDaysInOneIteration();
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

module.exports = {calculateReleasePlan};

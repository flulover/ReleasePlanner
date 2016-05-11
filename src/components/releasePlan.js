/**
 *
 * Created by yzzhou on 5/5/16.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var ActionFactory = require('../actions/ActionFactory');
var SettingsStore = require('../stores/SettingsStore');
var Settings = require('../components/settings');
var ReleaseForm = require('../components/releaseForm');

var ReleaseList = React.createClass({
    createNoteNode: function (factList) {
        return (
            <ul>
            {factList.map(function (fact, index) {
                return (
                <li key={'fact-note-' + index}>
                    {fact.impactedNote + '(' + fact.impactedPoints + ' point' + ((Math.abs(fact.impactedPoints) > 1) ? 's': '') + ')'}
                </li>);
            })}
            </ul>
        );
    },
    createReleaseNode: function (release) {
        return (
            <tr key={release.id}>
                <td>{release.get('name')}</td>
                <td>{release.get('scope')}</td>
                <td>{release.get('developmentIterations')}</td>
                <td>{release.get('regressionIterations')}</td>
                <td>{release.get('buffer')}</td>
                <td>{release.get('bestReleaseDate')}</td>
                <td>{release.get('worstReleaseDate')}</td>
                <td>{this.createNoteNode(release.get('factList'))}</td>
                <td>Actions</td>
            </tr>
        );
    },
    render: function () {
       return (
           <table>
               <thead>
               <tr>
                   <th>Release Name</th>
                   <th>Scope</th>
                   <th>Development Iterations</th>
                   <th>Regression Iterations</th>
                   <th>Buffer</th>
                   <th>Release Date(Best)</th>
                   <th>Release Date(Worst)</th>
                   <th>Note</th>
                   <th>Actions</th>
               </tr>
               </thead>
               <tbody>
                   {this.props.releases.map(this.createReleaseNode)}
               </tbody>
           </table>
       );
    }
});

var ReleasePlan = React.createClass({
    getInitialState: function () {
        return {
            releaseList: []
        };
    },
    getIterationLengthByDay: function () {
        return this.state.iterationLength * 7;
    },
    getWayToCalculateDevelopmentIterationFunc: function (wayToCalculateDevelopmentIteration) {
        if (wayToCalculateDevelopmentIteration === ''
            || wayToCalculateDevelopmentIteration === undefined){
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
    },
    getVelocityForOneDay: function () {
        var workDayForeachIteration = this.getIterationLengthByDay()*5/7;
        var velocityForOneDay = this.state.velocity / workDayForeachIteration;
        return velocityForOneDay;
    },
    getDiffDays: function (startDate, endDate) {
        var oneDay = 24*60*60*1000;
        return Math.round(Math.abs((endDate.getTime() - startDate.getTime())/(oneDay)));
    },
    getImpactedPoint: function (release) {
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
                    var velocityForOneDay = this.getVelocityForOneDay();
                    var diffDays = this.getDiffDays(new Date(fact['startDate']), new Date(fact['endDate']));
                    fact.impactedPoints = Math.ceil(diffDays * velocityForOneDay);
                    impactedPoints += fact.impactedPoints;
                }
            }
        }

        return impactedPoints
    },
    calculateReleasePlanForOneRelease: function (release, startDate, mayDelayDay) {
        var wayToCalculateDevelopmentIterationFunc = this.getWayToCalculateDevelopmentIterationFunc(release.get('wayToCalculateDevelopmentIteration'));
        var idealDevelopmentIterations = wayToCalculateDevelopmentIterationFunc(release.get('scope') / this.state.velocity);
        var iterationLengthByDay = this.getIterationLengthByDay();
        var lastIterationPoints = release.get('scope') - (idealDevelopmentIterations - 1) * this.state.velocity;
        var impactedPoints = this.getImpactedPoint(release);
        var tailIterationCount = wayToCalculateDevelopmentIterationFunc((lastIterationPoints + impactedPoints*-1)/this.state.velocity);
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
    },
    calculateReleasePlan: function (rawReleaseList) {
        var firstRelease = rawReleaseList[0];
        var firstStartDate = this.adjustStartDate(new Date(firstRelease.get('startDate')));
        var bufferByDay = firstRelease.get('buffer') * this.getIterationLengthByDay();

        var releaseList = [];
        releaseList.push(this.calculateReleasePlanForOneRelease(firstRelease, firstStartDate, bufferByDay));

        for(var i = 1; i < rawReleaseList.length; ++i){
            var release = rawReleaseList[i];
            var lastReleaseDate = new Date(releaseList[i - 1].get('bestReleaseDate'));
            var startDate = lastReleaseDate;
            startDate.setDate(lastReleaseDate.getDate() + 1);
            startDate = this.adjustStartDate(startDate);

            var mayDelayDay = 0;
            for (var j = 0; j < rawReleaseList.length; ++j){
                mayDelayDay += rawReleaseList[j].get('buffer') * this.getIterationLengthByDay();
            }
            releaseList.push(this.calculateReleasePlanForOneRelease(release, startDate, mayDelayDay));
        }
        return releaseList;
    },
    adjustStartDate: function (date) {
        var adjustStartDate = new Date(date);
        var weekdaySequence = date.getDay();
        adjustStartDate.setDate(date.getDate() + 4 - weekdaySequence);
        return adjustStartDate;
    },
    loadReleaseList: function () {
        var Release = AV.Object.extend('Release');
        var query = new AV.Query(Release);
        var self = this;
        query.find().then(function(results) {
            if (results.length == 0){
                return;
            }

            var releaseList = self.calculateReleasePlan(results)
            self.setState({
                releaseList: releaseList
            });

        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    handleReleaseSubmit: function (release) {
        var Release = AV.Object.extend('Release');
        var release = new Release(release);
        var self = this;
        release.save().then(
            function (release) {
                var releaseList = self.calculateReleasePlan(self.state.releaseList.concat(release));
                self.setState({
                    releaseList: releaseList
                });
            }
        );
    },
    render: function () {
        return (
            <div>
                <Settings></Settings>
                <ReleaseForm onReleaseSubmit={this.handleReleaseSubmit}></ReleaseForm>
                <ReleaseList releases={this.state.releaseList}></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

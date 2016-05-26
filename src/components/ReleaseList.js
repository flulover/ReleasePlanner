/**
 * Created by yzzhou on 5/13/16.
 */

import React from 'react';
import Util from '../util/Util';

var ReleaseList = React.createClass({
    createNoteNode(factList) {
        return (
            <ul>
                {factList.map((fact, index) => {
                    let leaveNote = '';
                    if (fact.type === 'publicHoliday'){
                        let startDate = new Date(fact.startDate);
                        let endDate = new Date(fact.endDate);
                        const duration = Util.getDiffWorkDays(startDate, endDate);
                        const multipleDays = duration > 1 ? 's' : '';
                        leaveNote = duration + ' day' + multipleDays +
                            ' public holiday from ' + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString() + '. ';
                    }else if (fact.type === 'personalLeave'){
                        let name = fact.name;
                        let startDate = new Date(fact.startDate);
                        let endDate = new Date(fact.endDate);
                        const duration = Util.getDiffWorkDays(startDate, endDate);
                        const multipleDays = duration > 1 ? 's' : '';
                        leaveNote = duration + ' work day' + multipleDays +
                            ' personal leave asked by ' + name  + ' from ' + startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString() + '. ';
                    }
                    return (
                        <li key={'fact-note-' + index}>
                            {leaveNote}{fact.impactedNote + '(-' + fact.impactedPoints + ' point' + ((Math.abs(fact.impactedPoints) > 1) ? 's': '') + ')'}
                        </li>);
                })}
            </ul>
        );
    },
    createReleaseNode(release) {
        return (
            <tr key={release.objectId}>
                <td>{release['name']}</td>
                <td>{release['scope']}</td>
                <td>{release['developmentIterations']}</td>
                <td>{release['regressionIterations']}</td>
                <td>{release['buffer']}</td>
                <td>{release['bestReleaseDate']}</td>
                <td>{release['worstReleaseDate']}</td>
                <td>{this.createNoteNode(release['factList'])}</td>
                <td>Actions</td>
            </tr>
        );
    },
    render() {
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

module.exports = ReleaseList;

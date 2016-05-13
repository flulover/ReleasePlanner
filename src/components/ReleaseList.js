/**
 * Created by yzzhou on 5/13/16.
 */

import React from 'react';

var ReleaseList = React.createClass({
    createNoteNode(factList) {
        return (
            <ul>
                {factList.map((fact, index) => {
                    return (
                        <li key={'fact-note-' + index}>
                            {fact.impactedNote + '(' + fact.impactedPoints + ' point' + ((Math.abs(fact.impactedPoints) > 1) ? 's': '') + ')'}
                        </li>);
                })}
            </ul>
        );
    },
    createReleaseNode(release) {
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

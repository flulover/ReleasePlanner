/**
 *
 * Created by yzzhou on 5/5/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReleasePlanStore from '../stores/ReleasePlanStore';
import Settings from './Settings';
import ReleaseForm from './ReleaseForm';
import ActionFactory from '../actions/ActionFactory';

var ReleaseList = React.createClass({
    createNoteNode(factList) {
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

var ReleasePlan = React.createClass({
    getInitialState() {
        return {
            releasePlanList: []
        };
    },
    componentDidMount() {
        ReleasePlanStore.addChangeListener(this.onChange);
    },
    componentWillUnmount() {
        ReleasePlanStore.removeChangeListener(this.onChange);
    },
    onChange() {
        this.setState({releasePlanList: ReleasePlanStore.getReleaseList()});
    },
   handleReleaseSubmit(release) {
        var Release = AV.Object.extend('Release');
        var release = new Release(release);
        release.save().then(
            function (release) {
                ActionFactory.addReleasePlan(release);
            }
        );
    },
    render() {
        return (
            <div>
                <Settings></Settings>
                <ReleaseForm onReleaseSubmit={this.handleReleaseSubmit}></ReleaseForm>
                <ReleaseList releases={this.state.releasePlanList}></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

/**
 *
 * Created by yzzhou on 5/11/16.
 */

import React from 'react';
import ActionFactory from '../actions/ActionFactory';
import SettingsStore from '../stores/SettingsStore';

var Settings = React.createClass({
    getInitialState() {
        return {
            developerCount: 0,
            velocity: 0,
            iterationLength: 0,
        };
    },
    componentDidMount() {
        SettingsStore.addChangeListener(this.onChange);
    },
    componentWillUnmount() {
        SettingsStore.removeChangeListener(this.onChange);
    },
    onChange() {
        this.setState(SettingsStore.getSettings());
    },
    handleDeveloperCountChanged(e) {
        ActionFactory.changeDeveloperCount(parseInt(e.target.value));
    },
    handleVelocityChanged(e) {
        ActionFactory.changeVelocity(parseInt(e.target.value));
    },
    handleIterationLengthChanged(e) {
        ActionFactory.changeIterationLength(parseInt(e.target.value));
    },
    render: function () {
        return (
            <div>
                <h2>Settings</h2>
                <form>
                    <label>Developer Count: <input type="number" value={this.state.developerCount} onChange={this.handleDeveloperCountChanged}/></label><br/>
                    <label>Velocity: <input type="number" value={this.state.velocity} onChange={this.handleVelocityChanged}/></label><br/>
                    <label>Iteration Length: <input type="number" value={this.state.iterationLength} onChange={this.handleIterationLengthChanged}/><span>&nbsp;Week</span></label><br/>
                </form>
            </div>
        );
    }
});

module.exports = Settings;

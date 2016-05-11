/**
 *
 * Created by yzzhou on 5/11/16.
 */

var React = require('react');
var ActionFactory = require('../actions/ActionFactory');
var SettingsStore = require('../stores/SettingsStore');

var Settings = React.createClass({
    getInitialState: function () {
        return {
            developerCount: 0,
            velocity: 0,
            iterationLength: 0,
        };
    },
    componentDidMount: function () {
        SettingsStore.addChangeListener(this.onChange);
    },
    componentWillUnmount: function () {
        SettingsStore.removeChangeListener(this.onChange);
    },
    onChange: function () {
        this.setState(SettingsStore.getSettings());
    },
    handleDeveloperCountChanged: function (e) {
        ActionFactory.changeDeveloperCount(parseInt(e.target.value));
    },
    handleVelocityChanged: function (e) {
        ActionFactory.changeVelocity(parseInt(e.target.value));
    },
    handleIterationLengthChanged: function (e) {
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
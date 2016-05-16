/**
 *
 * Created by yzzhou on 5/5/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReleasePlanStore from '../stores/ReleasePlanStore';
import Settings from './Settings';
import ReleaseForm from './ReleaseForm';
import ReleaseList from './ReleaseList';
import SettingsStore from '../stores/SettingsStore';


var ReleasePlan = React.createClass({
    getInitialState() {
        return {
            releasePlanList: []
        };
    },
    componentDidMount() {
        ReleasePlanStore.addChangeListener(this.onChange);
        SettingsStore.addChangeListener(this.onChange);
    },
    componentWillUnmount() {
        ReleasePlanStore.removeChangeListener(this.onChange);
        SettingsStore.removeListener(this.onChange);
    },
    onChange() {
        this.setState({releasePlanList: ReleasePlanStore.getReleaseList()});
    },
    render() {
        return (
            <div>
                <Settings></Settings>
                <ReleaseForm></ReleaseForm>
                <ReleaseList releases={this.state.releasePlanList}></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

/**
 *
 * Created by yzzhou on 5/5/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReleasePlanStore from '../stores/ReleasePlanStore';
import Settings from './Settings';
import CreateReleaseForm from './CreateReleaseForm';
import EditReleaseForm from './EditReleaseForm';
import ReleaseList from './ReleaseList';
import SettingsStore from '../stores/SettingsStore';


var ReleasePlan = React.createClass({
    getInitialState() {
        return {
            releasePlanList: [],
            editingReleasePlan: undefined,
        };
    },
    componentDidMount() {
        ReleasePlanStore.addChangeListener(this.onChange);
        SettingsStore.addChangeListener(this.onChange);
        ReleasePlanStore.addEditReleasePlanListener(this.onEditReleasePlan);
    },
    componentWillUnmount() {
        ReleasePlanStore.removeChangeListener(this.onChange);
        SettingsStore.removeListener(this.onChange);
        ReleasePlanStore.removeEditReleasePlanListener(this.onEditReleasePlan);
    },
    onChange() {
        this.setState({releasePlanList: ReleasePlanStore.getReleaseList()});
    },
    onEditReleasePlan(editingReleasePlan){
        this.setState({editingReleasePlan});
    },
    render() {
        return (
            <div>
                <Settings></Settings>
                <CreateReleaseForm></CreateReleaseForm>
                <EditReleaseForm release={this.state.editingReleasePlan}></EditReleaseForm>
                <ReleaseList releases={this.state.releasePlanList}></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

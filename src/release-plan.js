/**
 *
 * Created by yzzhou on 5/5/16.
 */

var Settings = React.createClass({
    getInitialState: function () {
        return {
            isPanelClosed: true
        };
    },
    toggleSettingPanel: function () {
        this.setState({isPanelClosed: !this.state.isPanelClosed});
    },
    handleDeveloperCountChanged: function (e) {
        this.props.settingsChanged({developerCount: parseInt(e.target.value)});
    },
    handleVelocityChanged: function (e) {
        this.props.settingsChanged({velocity: parseInt(e.target.value)});
    },
    handleIterationLengthChanged: function (e) {
        this.props.settingsChanged({iterationLength: parseInt(e.target.value)});
    },
    render: function () {
        return (
            <div>
                <button onClick={this.toggleSettingPanel}>Settings</button>
                <form hidden={this.state.isPanelClosed}>
                    <label>Developer Count: <input type="number" onChange={this.handleDeveloperCountChanged}/></label><br/>
                    <label>Velocity: <input type="number" onChange={this.handleVelocityChanged}/></label><br/>
                    <label>Iteration Length: <input type="number" onChange={this.handleIterationLengthChanged}/><span>&nbsp;Week</span></label><br/>
                </form>
            </div>
        );
    }
});

var ReleaseForm = React.createClass({
    getInitialState: function () {
        return {
            isFormClosed: true,
            name: '',
            scope: 0,
            startDate: Date.parse('1999/09/09'),
            regressionIteration: 1,
            buffer: 0.5
        };
    },
    handleNameChanged: function (e) {
        this.setState({
            name: e.target.value
        });
    },
    handleScopeChanged: function (e) {
        this.setState({
            scope: parseInt(e.target.value)
        });
    },
    handleStartDateChanged: function (e) {
        this.setState({
            startDate: Date.parse(e.target.value)
        });
    },
    handleRegressionIterationChanged: function (e) {
        this.setState({
            regressionIteration: parseInt(e.target.value)
        });
    },
    handleBufferChanged: function (e) {
        this.setState({
            buffer: parseFloat(e.target.value)
        });
    },
    toggleReleaseForm: function () {
        this.setState({isFormClosed: !this.state.isFormClosed});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        this.props.onReleaseSubmit(this.state);
    },
    render: function () {
       return (
           <div>
               <button onClick={this.toggleReleaseForm}>New Release</button>
               <form hidden={this.state.isFormClosed} onSubmit={this.handleSubmit}>
                   <h3>Create Release</h3>
                   <label>Name <input type="text" onChange={this.handleNameChanged} /></label><br/>
                   <label>Scope <input type="text" onChange={this.handleScopeChanged} /></label><br/>
                   <label>Start Date <input type="date" onChange={this.handleStartDateChanged} /></label><br/>
                   <label>Regression Iteration <input type="text" onChange={this.handleRegressionIterationChanged} /></label><br/>
                   <label>Buffer <input type="text" onChange={this.handleBufferChanged}/></label><br/>
                   <input type="submit" value="Save"/>
                   <input type="button" value="Cancel"/>
               </form>
           </div>
       );
    }
});

var ReleaseList = React.createClass({
    render: function () {
       return (
           <div>Release List</div>
       );
    }
});

var ReleasePlan = React.createClass({
    getInitialState: function () {
        return {
            developerCount: 0,
            velocity: 0,
            iterationLength: 0,
            releaseList: []
        };
    },
    componentDidMount: function () {
        var Settings = AV.Object.extend('Settings');
        var query = new AV.Query(Settings);
        var self = this;
        query.find().then(function(results) {
            var settings = results[0];
            self.setState({
                developerCount: settings.get('developerCount'),
                velocity: settings.get('velocity'),
                iterationLength: settings.get('iterationLength')
            });

        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    componentDidUpdate: function () {
        this.save();
   },
    handleSettingsChanged: function (settings) {
        this.setState(settings);
    },
    createNewSettings: function () {
        var Settings = AV.Object.extend('Settings');
        var settings = new Settings();
        settings.set('developerCount', this.state.developerCount);
        settings.set('velocity', this.state.velocity);
        settings.set('iterationLength', this.state.iterationLength);
        settings.save().then(function (settings) {
            console.log('New object created with objectId: ' + settings.id);
        }, function (err) {
            console.log('Failed to create new object, with error message: ' + err.message);
        });
    },
    updateSettings: function (settings) {
        var Settings = AV.Object.extend('Settings');
        var query = new AV.Query(Settings);
        var self = this;
        query.get(settings.id).then(function (settings) {
            settings.set('developerCount', self.state.developerCount);
            settings.set('velocity', self.state.velocity);
            settings.set('iterationLength', self.state.iterationLength);
            settings.save().then(function (settings) {
                console.log('Update object with objectId: ' + settings.id);
            }, function (err) {
                console.log('Failed to update object, with error message: ' + err.message);
            });
        }, function (error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    save: function () {
        var Settings = AV.Object.extend('Settings');
        var query = new AV.Query(Settings);
        var self = this;
        query.find().then(function(results) {
            if (results.length == 0){
                self.createNewSettings();
            }
            else {
                self.updateSettings(results[0]);
            }
        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
    },
    handleReleaseSubmit: function (release) {
        var Release = AV.Object.extend('Release');
        var release = new Release(release);
        release.save();
    },
    render: function () {
        return (
            <div>
                <Settings settingsChanged={this.handleSettingsChanged}></Settings>
                <div>Developer Count: {this.state.developerCount}</div>
                <div>Velocity: {this.state.velocity}</div>
                <div>Iteration Length: {this.state.iterationLength} Week</div>
                <ReleaseForm onReleaseSubmit={this.handleReleaseSubmit}></ReleaseForm>
                <ReleaseList></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

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
            regressionIterations: 1,
            buffer: 0.5
        };
    },
    toggleReleaseForm: function () {
        this.setState({isFormClosed: !this.state.isFormClosed});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var name = this.refs.releaseName.value;
        var scope = this.refs.releaseScope.value;
        var startDate = this.refs.releaseStartDate.value;
        var regressionIterations = this.refs.releaseRegressionIterations.value;
        var buffer = this.refs.releaseBuffer.value;
        this.props.onReleaseSubmit({
            name: name,
            scope: scope,
            startDate: startDate,
            regressionIterations: regressionIterations,
            buffer: buffer
        });
        this.setState({
            isFormClosed: true
        });
    },
    handleCancel: function () {
        this.setState({
            isFormClosed: true
        });
    },
    render: function () {
       return (
           <div>
               <button onClick={this.toggleReleaseForm}>New Release</button>
               <form hidden={this.state.isFormClosed} onSubmit={this.handleSubmit}>
                   <h3>Create Release</h3>
                   <label>Name <input ref="releaseName" type="text" /></label><br/>
                   <label>Scope <input ref="releaseScope" type="number" /></label><br/>
                   <label>Start Date <input ref="releaseStartDate" type="date" /></label><br/>
                   <label>Regression Iterations <input ref="releaseRegressionIterations" type="number" /></label><br/>
                   <label>Buffer <input ref="releaseBuffer" type="number" step="0.1" /></label><br/>
                   <input type="submit" value="Save"/>
                   <input type="button" onClick={this.handleCancel} value="Cancel"/>
               </form>
           </div>
       );
    }
});

var ReleaseList = React.createClass({
    createReleaseNode: function (release) {
        return (
            <tr key={release.id}>
                <td>{release.get('name')}</td>
                <td>{release.get('scope')}</td>
                <td>Development Iteration</td>
                <td>{release.get('regressionIterations')}</td>
                <td>{release.get('buffer')}</td>
                <td>Release Date(Best)</td>
                <td>Release Date(Worst)</td>
                <td>Note</td>
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
                   {this.props.items.map(this.createReleaseNode)}
               </tbody>
           </table>
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
        this.loadSettings();
        this.loadReleaseList();
    },
    componentDidUpdate: function () {
        this.save();
   },
    loadSettings: function () {
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
    loadReleaseList: function () {
        var Release = AV.Object.extend('Release');
        var query = new AV.Query(Release);
        var self = this;
        query.find().then(function(results) {
            self.setState({
                releaseList: results
            });

        }, function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        });
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
        var self = this;
        release.save().then(
            function (release) {
                self.setState({
                    releaseList: self.state.releaseList.concat(release)
                })
            }
        );
    },
    render: function () {
        return (
            <div>
                <Settings settingsChanged={this.handleSettingsChanged}></Settings>
                <div>Developer Count: {this.state.developerCount}</div>
                <div>Velocity: {this.state.velocity}</div>
                <div>Iteration Length: {this.state.iterationLength} Week</div>
                <ReleaseForm onReleaseSubmit={this.handleReleaseSubmit}></ReleaseForm>
                <ReleaseList items={this.state.releaseList}></ReleaseList>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

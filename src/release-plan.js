/**
 *
 * Created by yzzhou on 5/5/16.
 */

var Settings = React.createClass({
    getInitialState: function () {
        return {isPanelClosed: true};
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
    toggleSettingPanel: function () {
        this.setState({isPanelClosed: !this.state.isPanelClosed});
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

var ReleasePlan = React.createClass({
    getInitialState: function () {
        return {
            developerCount: 0,
            velocity: 0,
            iterationLength: 0
        };
    },
    componentDidUpdate: function () {
        this.save();
    },
    handleSettingsChanged: function (settings) {
        this.setState(settings);
    },
    save: function () {
        var Settings = AV.Object.extend('Settings');
        var settings = new Settings();
        settings.set('developerCount', this.state.developerCount);
        settings.set('velocity', this.state.velocity);
        settings.set('iterationLength', this.state.iterationLength);
        settings.save().then(function(post) {
            // 成功保存之后，执行其他逻辑.
            console.log('New object created with objectId: ' + post.id);
        }, function(err) {
            // 失败之后执行其他逻辑
            // error 是 AV.Error 的实例，包含有错误码和描述信息.
            console.log('Failed to create new object, with error message: ' + err.message);
        });
    },
    render: function () {
        return (
            <div>
                <Settings settings={this.state} settingsChanged={this.handleSettingsChanged}></Settings>
                <div>{this.state.developerCount}</div>
                <div>{this.state.velocity}</div>
                <div>{this.state.iterationLength}</div>
            </div>
        );
    }
});

ReactDOM.render(
    <ReleasePlan></ReleasePlan>,
    document.getElementById('releasePlan')
);

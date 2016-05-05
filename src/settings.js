var Settings = React.createClass({
    getInitialState: function () {
       return { isPanelClosed: true};
    },
    toggleSettingPanel: function () {
        this.setState({isPanelClosed: !this.state.isPanelClosed});
    },
    render: function () {
        return (
            <div>
                <button onClick={this.toggleSettingPanel}>Settings</button>
                <form hidden={this.state.isPanelClosed}>
                    <label>Developer Count: <input type="number"/></label><br/>
                    <label>Velocity: <input type="number"/></label><br/>
                    <label>Iteration Length: <input type="number"/><span>&nbsp;Week</span></label><br/>
                </form>
            </div>
        );
    }
});

ReactDOM.render(
    <Settings></Settings>,
    document.getElementById('settings')
);
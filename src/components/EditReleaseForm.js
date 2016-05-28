/**
 *
 * Created by yzzhou on 5/11/16.
 */

import React from 'react';
import ActionFactory from '../actions/ActionFactory';

var EditReleaseForm = React.createClass({
    getInitialState() {
        return {
            isFormClosed: true,
            factList: [],
        };
    },
    componentWillReceiveProps(){
        if (this.props.release === undefined){
            return;
        }

        this.setState({
            factList: this.props.release.get('factList'),
            isFormClosed: false});
    },
    toggleReleaseForm() {
        this.setState({isFormClosed: !this.state.isFormClosed});
    },
    getFactList() {
        var factList = [];
        for (var i = 0; i < this.state.factList.length; ++i){
            var fact = this.state.factList[i];
            var type = fact.type;
            if (type === 'other'){
                fact.impactedPoints = this.refs['impactedPoints-' + i].value;
                fact.impactedNote = this.refs['impactedNote-' + i].value;
            }else if (type === 'publicHoliday'){
                fact.startDate = this.refs['startDate-' + i].value;
                fact.endDate = this.refs['endDate-' + i].value;
                fact.impactedNote = this.refs['impactedNote-' + i].value;
                fact.customImpactedPoints = this.refs['customImpactedPoints-' + i].value;
            }else if (type === 'personalLeave'){
                fact.name = this.refs['name-' + i].value;
                fact.startDate = this.refs['startDate-' + i].value;
                fact.endDate = this.refs['endDate-' + i].value;
                fact.impactedNote = this.refs['impactedNote-' + i].value;
                fact.customImpactedPoints = this.refs['customImpactedPoints-' + i].value;
            }
            

            factList.push(fact);
        }
        return factList;
    },
    handleSubmit(e) {
        e.preventDefault();

        var name = this.refs.releaseName.value || 'No Name';
        var scope = this.refs.releaseScope.value || 0;
        var startDate = this.refs.releaseStartDate.value || '1900-01-01';
        var regressionIterations = this.refs.releaseRegressionIterations.value || 1;
        var buffer = this.refs.releaseBuffer.value || 0.5;
        var checkedWay = document.querySelector('input[name="wayToCalculateDevelopmentIteration"]:checked');
        var adjustFunc = checkedWay ? checkedWay.value : 'Ceil';
        var factList = this.getFactList();

        let release = {
            name,
            scope,
            startDate,
            regressionIterations,
            buffer,
            adjustFunc,
            factList
        };

        ActionFactory.addReleasePlan(release);
        this.setState({
            isFormClosed: true
        });
    },
    handleCancel() {
        this.setState({
            isFormClosed: true
        });
    },
    handleAddFact() {
        var fact = {
        };

        var factList = this.state.factList.concat(fact);
        this.setState({factList});
    },
    handleFactTypeChange(e) {
        var index = parseInt(e.target.id.split('-')[1]);
        this.state.factList[index].type = e.target.value;
        this.setState(this.state);
    },
    render() {
        if (this.props.release === undefined){
            return <div>123</div>;
        }

        var self = this;
        let basicInfo = (
            <div>
                <label>Name <input ref="releaseName" type="text" defaultValue={this.props.release.get('name')} /></label><br/>
                <label>Scope <input ref="releaseScope" type="number" defaultValue={this.props.release.get('scope')} /></label><br/>
                <label>Start Date <input ref="releaseStartDate" type="date" defaultValue={this.props.release.get('startDate')}  /></label><br/>
                <label>Regression Iterations <input ref="releaseRegressionIterations" type="number" step="0.1" defaultValue="1" defaultValue={this.props.release.get('regressionIterations')}/></label><br/>
                <label>Buffer <input ref="releaseBuffer" type="number" step="0.1" defaultValue={this.props.release.get('buffer')}/></label><br/>
                <label>Way To Calculate Development Iteration
                    <input type="radio" name="wayToCalculateDevelopmentIteration" ref="Ceil" value="Ceil" />Ceil
                    <input type="radio" name="wayToCalculateDevelopmentIteration" ref="RoundToHalf" value="RoundToHalf"/>Round to Half(2.3 or 2.7 to 2.5)
                    <input type="radio" name="wayToCalculateDevelopmentIteration" ref="Actually" value="Actually"/>Actually<br/>
                </label>
            </div>
        );

        let otherFact = (index, fact) => {
            return <div>
                <label>Impacted Points
                    <input type="number" ref={'impactedPoints-' + index} defaultValue={fact.impactedPoints}/>
                </label><br/>
                <label>Note
                    <textarea ref={'impactedNote-' + index} name="" id="" cols="20" rows="4" defaultValue={fact.impactedNote}></textarea>
                </label>
            </div>
        };

        let publicHolidayFact = (index, fact) => {
            return <div>
                <label>
                    Start Date
                    <input type="date" ref={'startDate-' + index} defaultValue={fact.startDate}/>
                </label>
                <label>
                    End Date
                    <input type="date" ref={'endDate-' + index} defaultValue={fact.endDate}/>
                </label><br/>
                <label>Note
                    <textarea ref={'impactedNote-' + index} name="" id="" cols="20" rows="4" defaultValue={fact.impactedNote}></textarea>
                </label><br/>
                <label>Custom Impact Points
                    <input type="number" ref={'customImpactedPoints-' + index} defaultValue={fact.customImpactedPoints}/>
                </label><br/>
            </div>
        };

        let personalLeaveFact = (index, fact) => {
            return <div>
                <label htmlFor="">
                    Name
                    <input type="text" ref={'name-' + index} defaultValue={fact.name}/>
                </label>
                <label>
                    Start Date
                    <input type="date" ref={'startDate-' + index} defaultValue={fact.startDate} />
                </label>
                <label>
                    End Date
                    <input type="date" ref={'endDate-' + index} defaultValue={fact.endDate} />
                </label><br/>
                <label>Note
                    <textarea ref={'impactedNote-' + index} name="" id="" cols="20" rows="4" defaultValue={fact.impactedNote}></textarea>
                </label><br/>
                <label>Custom Impact Points
                    <input type="number" ref={'customImpactedPoints-' + index}  defaultValue={fact.customImpactedPoints}/>
                </label><br/>
            </div>
        };

        return (
            <div>
                <form hidden={this.state.isFormClosed} onSubmit={this.handleSubmit}>
                    <h3>Edit Release Plan</h3>
                    {basicInfo}
                    {this.state.factList.map(function (fact, index) {
                        let defaultValue = fact.type ? fact.type : 'other';
                        return (
                            <div key={'fact' + index }>
                                <select value={defaultValue} ref={'factType-' + index}  id={'factType-' + index} onChange={self.handleFactTypeChange}>
                                    <option value="publicHoliday">Public Holiday</option>
                                    <option value="personalLeave">Personal Leave</option>
                                    <option value="other">Other</option>
                                </select>
                                { (() => {
                                    switch(self.state.factList[index].type){
                                        case "other":
                                            return otherFact(index, fact);
                                        case "publicHoliday":
                                            return publicHolidayFact(index, fact);
                                        case "personalLeave":
                                            return personalLeaveFact(index, fact);
                                } })()}
                            </div>
                        );
                    })}
                    <input type="button" value="Add Fact" onClick={this.handleAddFact}/><br/><br/>

                    <input type="submit" value="Save"/>
                    <input type="button" onClick={this.handleCancel} value="Cancel"/>
                </form>
            </div>
        );
    }
});

module.exports = EditReleaseForm;
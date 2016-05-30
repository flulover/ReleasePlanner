/**
 *
 * Created by yzzhou on 5/11/16.
 */

import React from 'react';
import ActionFactory from '../actions/ActionFactory';
import ReleasePlanStore from '../stores/ReleasePlanStore';
import Util from '../util/Util'

var EditReleaseForm = React.createClass({
    getInitialState() {
        return {
            isFormClosed: true,
            editingReleasePlan: {},
        };
    },
    componentDidMount() {
        ReleasePlanStore.addEditReleasePlanListener(this.onEditReleasePlan);
    },
    componentWillUnmount() {
        ReleasePlanStore.removeEditReleasePlanListener(this.onEditReleasePlan);
    },
    onEditReleasePlan(editingReleasePlan){
        this.setState({
            editingReleasePlan,
            isFormClosed: false,
        });
    },
    toggleReleaseForm() {
        this.setState({isFormClosed: !this.state.isFormClosed});
    },
    getFactListDto() {
        var factListDto = [];
        var factList =this.state.editingReleasePlan['factList'];
        for (var i = 0; i < factList.length; ++i){
            var factDto = factList[i];
            if (factDto === undefined){
                continue;
            }

            var type = factDto.type;
            if (type === 'other'){
                factDto.impactedPoints = this.refs['impactedPoints-' + i].value;
                factDto.impactedNote = this.refs['impactedNote-' + i].value;
            }else if (type === 'publicHoliday'){
                factDto.startDate = this.refs['startDate-' + i].value;
                factDto.endDate = this.refs['endDate-' + i].value;
                factDto.impactedNote = this.refs['impactedNote-' + i].value;
                factDto.customImpactedPoints = this.refs['customImpactedPoints-' + i].value;
            }else if (type === 'personalLeave'){
                factDto.name = this.refs['name-' + i].value;
                factDto.startDate = this.refs['startDate-' + i].value;
                factDto.endDate = this.refs['endDate-' + i].value;
                factDto.impactedNote = this.refs['impactedNote-' + i].value;
                factDto.customImpactedPoints = this.refs['customImpactedPoints-' + i].value;
            }

            factListDto.push(factDto);
        }
        return factListDto;
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
        var factList = this.getFactListDto();

        let release = {
            objectId: this.state.editingReleasePlan.objectId,
            name,
            scope,
            startDate,
            regressionIterations,
            buffer,
            adjustFunc,
            factList
        };

        ActionFactory.updateReleasePlan(release);
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
        let fact = {
            type: 'other'
        };

        this.state.editingReleasePlan.factList = this.state.editingReleasePlan.factList.concat(fact);
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    handleFactTypeChange(e) {
        var index = parseInt(e.target.id.split('-')[1]);
        this.state.editingReleasePlan.factList[index].type = e.target.value;
        this.setState(this.state);
    },
    onNameChanged(event){
        this.state.editingReleasePlan.name = event.target.value;
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    onScopeChanged(event){
        this.state.editingReleasePlan.scope = event.target.value;
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    onStartDateChanged(event){
        this.state.editingReleasePlan.startDate = event.target.value;
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    onBufferChanged(event){
        this.state.editingReleasePlan.buffer = event.target.value;
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    onRemoveFactButtonClicked(e){
        const index = parseInt(e.target.id.split('-')[1]);
        delete this.state.editingReleasePlan.factList[index];
        this.setState({editingReleasePlan: this.state.editingReleasePlan});
    },
    render() {
        var self = this;
        let editingReleasePlan = this.state.editingReleasePlan;
        if (Util.isEmptyObject(editingReleasePlan)){
            return <div></div>;
        }
        let basicInfo = (
            <div>
                <label>Name <input ref="releaseName" type="text" value={editingReleasePlan['name']} onChange={self.onNameChanged} /></label><br/>
                <label>Scope <input ref="releaseScope" type="number" value={editingReleasePlan['scope']} onChange={self.onScopeChanged} /></label><br/>
                <label>Start Date <input ref="releaseStartDate" type="date" value={Util.formatDateToYYYYmmDD(editingReleasePlan['startDate'])} onChange={self.onStartDateChanged}  /></label><br/>
                <label>Regression Iterations <input ref="releaseRegressionIterations" type="number" step="0.1" defaultValue={editingReleasePlan['regressionIterations']}/></label><br/>
                <label>Buffer <input ref="releaseBuffer" type="number" step="0.1" value={editingReleasePlan['buffer']} onChange={self.onBufferChanged}/></label><br/>
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
                <div hidden={this.state.isFormClosed}>
                    <h3>Edit Release Plan</h3>
                    {basicInfo}
                    {editingReleasePlan['factList'].map(function (fact, index) {
                        let defaultValue = fact.type ? fact.type : 'other';
                        return (
                            <div key={'fact' + index }>
                                <select value={defaultValue} ref={'factType-' + index}  id={'factType-' + index} onChange={self.handleFactTypeChange}>
                                    <option value="publicHoliday">Public Holiday</option>
                                    <option value="personalLeave">Personal Leave</option>
                                    <option value="other">Other</option>
                                </select>
                                { (() => {
                                    let factComponent;
                                    switch(self.state.editingReleasePlan.factList[index].type){
                                        case "other":
                                            factComponent = otherFact;
                                            break;
                                        case "publicHoliday":
                                            factComponent = publicHolidayFact;
                                            break;
                                        case "personalLeave":
                                            factComponent = personalLeaveFact;
                                            break;
                                    }
                                    return <div>
                                        <input type="button" value="Remove Fact" id={'removeButton-' + index} onClick={self.onRemoveFactButtonClicked} />
                                        {factComponent(index, fact)}
                                    </div>
                                })()}
                            </div>
                        );
                    })}
                    <input type="button" value="Add Fact" onClick={this.handleAddFact}/><br/><br/>

                    <input type="button" value="Save" onClick={this.handleSubmit}/>
                    <input type="button" onClick={this.handleCancel} value="Cancel"/>
                </div>
            </div>
        );
    }
});

module.exports = EditReleaseForm;

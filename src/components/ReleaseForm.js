/**
 *
 * Created by yzzhou on 5/11/16.
 */

import React from 'react';

var ReleaseForm = React.createClass({
    getInitialState() {
        return {
            isFormClosed: false,
            factList: []
        };
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
                fact.impactedNote = this.refs['impactedNote-' + i].value;
                fact.customImpactedPoints = this.refs['customImpactedPoints-' + i].value;
                fact.startDate = this.refs['startDate-' + i].value;
                fact.endDate = this.refs['endDate-' + i].value;
            }else if (type === 'personalLeave'){

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
        var wayToCalculateDevelopmentIteration = checkedWay ? checkedWay.value : 'Ceil';
        var factList = this.getFactList();

        this.props.onReleaseSubmit({
            name: name,
            scope: scope,
            startDate: startDate,
            regressionIterations: regressionIterations,
            buffer: buffer,
            wayToCalculateDevelopmentIteration: wayToCalculateDevelopmentIteration,
            factList: factList
        });
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
            type: 'other'
        };

        var factList = this.state.factList.concat(fact);
        this.setState({factList: factList});
    },
    handleFactTypeChange(e) {
        var index = parseInt(e.target.id.split('-')[1]);
        var state = this.state;
        state.factList[index].type = e.target.value;
        this.setState(state);
    },
    render() {
        var self = this;
        return (
            <div>
                <button onClick={this.toggleReleaseForm}>New Release</button>
                <form hidden={this.state.isFormClosed} onSubmit={this.handleSubmit}>
                    <h3>Create Release</h3>
                    <label>Name <input ref="releaseName" type="text" defaultValue="ais 2a" /></label><br/>
                    <label>Scope <input ref="releaseScope" type="number" defaultValue="100"/></label><br/>
                    <label>Start Date <input ref="releaseStartDate" type="date" /></label><br/>
                    <label>Regression Iterations <input ref="releaseRegressionIterations" type="number" step="0.1" defaultValue="1"/></label><br/>
                    <label>Buffer <input ref="releaseBuffer" type="number" step="0.1" defaultValue="0.5"/></label><br/>
                    <label>Way To Calculate Development Iteration
                        <input type="radio" name="wayToCalculateDevelopmentIteration" ref="Ceil" value="Ceil" />Ceil
                        <input type="radio" name="wayToCalculateDevelopmentIteration" ref="RoundToHalf" value="RoundToHalf"/>Round to Half(2.3 or 2.7 to 2.5)
                        <input type="radio" name="wayToCalculateDevelopmentIteration" ref="Actually" value="Actually"/>Actually<br/>
                    </label>

                    {this.state.factList.map(function (fact, index) {
                        return (
                            <div key={'fact' + index }>
                                <select defaultValue="other" ref={'factType-' + index}  id={'factType-' + index} onChange={self.handleFactTypeChange}>
                                    <option value="publicHoliday">Public Holiday</option>
                                    <option value="personalLeave">Personal Leave</option>
                                    <option value="other">Other</option>
                                </select>
                                <div hidden={self.state.factList[index].type != 'other'}>
                                    <label>Impacted Points
                                        <input type="number" ref={'impactedPoints-' + index}/>
                                    </label><br/>
                                    <label>Note
                                        <textarea ref={'impactedNote-' + index} name="" id="" cols="20" rows="4"></textarea>
                                    </label>
                                </div>
                                <div hidden={self.state.factList[index].type != 'publicHoliday'}>
                                    <label>
                                        Start Date
                                        <input type="date" ref={'startDate-' + index}/>
                                    </label>
                                    <label>
                                        End Date
                                        <input type="date" ref={'endDate-' + index}/>
                                    </label><br/>
                                    <label>Note
                                        <textarea ref={'impactedNote-' + index} name="" id="" cols="20" rows="4"></textarea>
                                    </label><br/>
                                    <label>Custom Impact Points
                                        <input type="number" ref={'customImpactedPoints-' + index}/>
                                    </label><br/>
                                </div>
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

module.exports = ReleaseForm;

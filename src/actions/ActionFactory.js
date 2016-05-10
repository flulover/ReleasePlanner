/**
 *
 * Created by yzzhou on 5/11/16.
 */
var Dispatcher = require('../dispatcher/dispatcher');
var Constant = require('../constants/constants');

var CreateFactory = {
    changeDeveloperCount: function (developerCount) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_DEVELOPER_COUNT,
            value: developerCount
        });
    },
    changeVelocity: function (velocity) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_VELOCITY,
            value: velocity
        });
    },
    changeIterationLength: function (iterationLength) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_ITERATION_LENGTH,
            value: iterationLength
        });
    },
};

module.exports = CreateFactory;

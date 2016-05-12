/**
 *
 * Created by yzzhou on 5/11/16.
 */
import Dispatcher from '../dispatcher/dispatcher';
import Constant from '../constants/constants';

var ActionFactory = {
    changeDeveloperCount(developerCount) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_DEVELOPER_COUNT,
            value: developerCount
        });
    },
    changeVelocity(velocity) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_VELOCITY,
            value: velocity
        });
    },
    changeIterationLength(iterationLength) {
        Dispatcher.dispatch({
            type: Constant.SETTING_CHANGE_ITERATION_LENGTH,
            value: iterationLength
        });
    },
    loadReleasePlans() {
        Dispatcher.dispatch( {
            type: Constant.RELEASE_PLAN_LOAD
        });
    },
    addReleasePlan(release) {
        Dispatcher.dispatch( {
            type: Constant.RELEASE_PLAN_ADD,
            value: release
        });
    }
};

module.exports = ActionFactory;

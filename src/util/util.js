/**
 *
 * Created by yzzhou on 5/11/16.
 */

function _getDiffWorkDays(startDate, endDate) {
    if (startDate.getTime() > endDate.getTime()){
        return 0;
    }

    let workDay = 0;
    for (let curDate = new Date(startDate); curDate.getTime() != endDate.getTime();){
        if (curDate.getDay() === 0 || curDate.getDay() === 6){
            workDay++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return workDay;
}

var Util = {
    getDiffWorkDays: _getDiffWorkDays,
};

module.exports = Util;

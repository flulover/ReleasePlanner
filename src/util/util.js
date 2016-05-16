/**
 *
 * Created by yzzhou on 5/11/16.
 */

function _getDiffDays(startDate, endDate, ignoreWeekend) {
    if (startDate.getTime() > endDate.getTime()){
        return 0;
    }

    let workDay = 1;
    for (let curDate = new Date(startDate); curDate.getTime() != endDate.getTime();){
        if (ignoreWeekend){
            if (curDate.getDay() > 1 && curDate.getDay() < 5){
                workDay++;
            }
        }
        else{
            workDay++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return workDay;
}

function getDiffWorkDays(startDate, endDate) {
    return _getDiffDays(startDate, endDate, true);
}

function getDiffDays(startDate, endDate) {
    return _getDiffDays(startDate, endDate, false);
}

function getOverlapDateRange(startDate1, endDate1, startDate2, endDate2) {
    let startDate = startDate1.getTime() > startDate2.getTime() ? startDate1 : startDate2;
    let endDate = endDate1.getTime() < endDate2.getTime() ? endDate1 : endDate2;
    return {startDate, endDate};
}

var Util = {
    getDiffWorkDays,
    getDiffDays,
    getOverlapDateRange,
};

module.exports = Util;

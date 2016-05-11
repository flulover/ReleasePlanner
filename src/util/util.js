/**
 *
 * Created by yzzhou on 5/11/16.
 */

function _getDiffDays(startDate, endDate) {
    var oneDay = 24*60*60*1000;
    return Math.round(Math.abs((endDate.getTime() - startDate.getTime())/(oneDay)));
}

var Util = {
    getDiffDays: _getDiffDays,
};

module.exports = Util;

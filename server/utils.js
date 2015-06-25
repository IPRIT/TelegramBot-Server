/**
 * Created by Александр on 25.06.2015.
 */

module.exports = {
    log: Logger
};

function Logger() {
    var zeroFill = function(num) {
        return num < 10 ? '0' + num.toString() : num.toString();
    };
    var serverTime = new Date(),
        mskOffset = 3;
    var args = Array.prototype.slice.call(arguments),
        date = new Date(serverTime.getTime() + serverTime.getTimezoneOffset() * 60 * 1000 + mskOffset * 3600 * 1000),
        curTime = '[' + zeroFill(date.getHours()) + ':' + zeroFill(date.getMinutes()) +
            ':' + zeroFill(date.getSeconds()) + ']';
    args.unshift(curTime);
    console.log.apply(console, args);
}
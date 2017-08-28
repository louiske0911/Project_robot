/**
 * @fileoverview Time utilities for timezone-aware time displays
 */
let moment = require('moment-timezone');
let config = require('./config');

const DEFAULT_TZ = config.get('system_timezone');  // default timezone used in TaaS UI


/**
 * Convert the timestamp to a string
 *
 * @param {number} timestamp unix timestamp
 * @param {string} formatStr (optional) time format string according to the Moment package.
 *   Default to 'YYYY-MM-DD HH:mm:ss'
 * @param {string} timezone (optional) timezone in displaying the time.
 *   Default to the 'system_timezone' variable in TaaS configuration.
 * @return {string} the formatted string. If the conversion is unsuccessful, the result is undefined.
 */
function formatTime(timestamp, formatStr, timezone) {
    if (!formatStr) formatStr = 'YYYY-MM-DD HH:mm:ss';
    if (!timezone) timezone = DEFAULT_TZ;

    let time = moment.tz(timestamp, timezone);
    return time.format(formatStr);
}


/**
 * Generate relative time to now
 *
 * @param {number} timestamp unix timestamp
 * @param {string} [timezone] (optional) timezone in displaying the time
 * @return {string} the formatted string
 */
function formatRelativeTime(timestamp, timezone) {
    if (!timezone) timezone = DEFAULT_TZ;

    let time = moment.tz(timestamp, timezone);
    return time.fromNow();
}


/**
 * Generate duration
 *
 * @param {number} duration duration value
 * @param {string} [unit] (optional) duration unit;
 *                        could be 'milliseconds', 'seconds', 'minutes', 'hours', 'days',
 *                        'weeks', 'months', 'years';
 *                        default is 'milliseconds'
 * @return {string} the formatted string
 */
function formatDuration(duration, unit) {
    if (!unit) unit = 'ms';

    let time = moment.duration(duration, unit);
    return time.humanize();
}


exports.formatTime = formatTime;
exports.formatRelativeTime = formatRelativeTime;
exports.formatDuration = formatDuration;

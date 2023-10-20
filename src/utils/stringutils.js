function caseInsensitiveCompare(str1, str2) {
    return str1.localeCompare(str2, undefined, {sensitivity: 'base'});
}

function ISO8601_to_standard(date, showYear=true) {
    return date.split('T')[0].split('-').splice(showYear ? 0 : 1, showYear ? 3 : 2).join('/');
}

// Convert yyyy-mm-dd to ISO8601 and vice versa
function ymd_to_ISO8601(dateStr) {
    return dateStr ? `${dateStr}T00:00:00` : null;
}

function ISO8601_to_ymd(iso8601Str) {
    return iso8601Str ? iso8601Str.split('T')[0] : null;
}

export { caseInsensitiveCompare, ISO8601_to_standard, ymd_to_ISO8601, ISO8601_to_ymd };
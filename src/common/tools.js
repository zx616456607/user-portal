export function tenxDateFormat(oldDate) {
  let newDate = oldDate.replace("T", " ");
  newDate = newDate.replace("Z", " ");
  newDate = newDate.split("+")[0];
  return newDate;
}

// Y year
// M month
// D day
// h hour
// m minute
// s second
export function formateDate(date, format) {
  if(Object.prototype.toString.call(date).indexOf('Date') < 0) {
    throw new Error('The first argument must be Date')
  }
  if(typeof format !== 'string') {
    throw new Error('The second argument must be string')
  }
  const uDate = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  }
  return format.replace(/YYYY/, uDate.year).replace(/MM/, uDate.month).replace(/DD/, uDate.day).replace(/hh/, uDate.hour).replace(/mm/, uDate.minute).replace(/ss/, uDate.second)
}
export function tenxDateFormat(oldDate) {
  let newDate = oldDate.replace("T", " ");
  newDate = newDate.replace("Z", " ");
  newDate = newDate.split("+")[0];
  return newDate;
}
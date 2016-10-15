export function tenxDateFormat(oldDate) {
  let newDate = oldDate.replace("T", " ");
  newDate = newDate.split("+")[0];
  return newDate;
}
import moment from 'moment';

export function convertDateString(dateStr, timeStr) {
  if (
    dateStr &&
    !isNaN(new Date(dateStr).getTime()) &&
    timeStr &&
    !isNaN(new Date(timeStr).getTime())
  ) {
    console.log('date time ran');
    let date = moment(dateStr).local().format('YYYY-MM-DD ');
    let time = moment(timeStr).local().format('hh:mm:ss a');
    return date + time + '\n';
  }

  if (
    dateStr &&
    !isNaN(new Date(dateStr).getTime()) &&
    (!timeStr || isNaN(new Date(timeStr).getTime()))
  ) {
    console.log('date ran');
    let date = moment(dateStr).local().format('YYYY-MM-DD hh:mm:ss a');
    return date + '\n';
  }

  if (
    timeStr &&
    !isNaN(new Date(timeStr).getTime()) &&
    (!dateStr || isNaN(new Date(dateStr).getTime()))
  ) {
    console.log('time ran');
    let time = moment(timeStr).local().format('YYYY-MM-DD hh:mm:ss a');
    return time + '\n';
  }

  if (
    (!dateStr || isNaN(new Date(dateStr).getTime())) &&
    (!timeStr || isNaN(new Date(timeStr).getTime()))
  )
    return '\n';
}

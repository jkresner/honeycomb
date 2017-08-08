var Moment = {
  now: () => moment(),
  today: () => moment(moment().format('YYYY MMM DD'), 'YYYY MMM DD'),
  anHourAgo: () => moment().add(-1,'hour'),
  hoursAgo: (hours) => moment().add(-1*hours,'hour'),
  in: (amount, unit) => moment().add(amount, unit.toLowerCase()),
  firstOfMonth: (month) => moment((month||moment()).format('YYYY MMM'), 'YYYY MMM'),
  inRange(val, start, end)
  {
    var isAfterStart = (start) ? val.isAfter(start) : true
    var isBeforeEnd = (end) ? val.isBefore(end) : true
    return isAfterStart && isBeforeEnd
  },
  duration: {
    dehumanize(durationStr) {
      if (!durationStr) return moment.duration()
      if (durationStr == "a minute") durationStr = "1 minutes"
      if (durationStr == "an hour") durationStr = "1 hours"
      var d = {}
      var bits = durationStr.split(' ')
      d[bits[1]] = parseInt(bits[0])
      return moment.duration(d)
    }
  },
  timezone: {
    idToName: (id) => moment.tz(id).format('zz'),
    idToShortName: (id) => moment.tz(id).format('z')
  }
}

module.exports = {

  Moment,

  // DateTime.now()
  now: () =>
    Moment.now().toDate(),

  // DateTime.today()
  today: () =>
    Moment.today().toDate(),

  // DateTime.anHourAgo()
  anHourAgo: () =>
    Moment.anHourAgo().toDate(),

  // DateTime.hoursAgo(2)
  hoursAgo: (hours) =>
    Moment.hourAgo(hours).toDate(),

  // DateTime.in(2,'minutes')
  in: (amount, unit) =>
    Moment.in(amount, unit).toDate(),

  // DateTime.inRange(startDateOrMoment,endDateOrMoment)(aDateOrMmoment)
  inRange: (start, end) =>
    (val) => Moment.inRange(moment(val), moment(start), moment(end)),

  duration: {
    dehumanize: (str) => Moment.duration.dehumanize(str)
  },

  // DateTime.fistOfMonth(aDateOrMmoment)
  // firstOfMonth: (mth) =>
  //   Moment.firstOfMonth(moment(mth)).toDate(),

  timezone: {
    idToName: (id) => Moment.timezone.idToName(id),
    idToShortName: (id) => Moment.timezone.idToShortName(id)
  },

  // sessionCreated: (session) =>
  //   moment(session.cookie._expires).subtract(session.cookie.originalMaxAge,'ms')


}

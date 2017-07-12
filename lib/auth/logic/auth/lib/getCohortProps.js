//------ temp dirty copy pastes to remove
function momentSessionCreated(session) {
  return new moment(session.cookie._expires).subtract(session.cookie.originalMaxAge,'ms')
}

function ObjectId2Date(id) {
  return new Date(parseInt(id.toString().slice(0, 8), 16) * 1000)
}
function dateWithDayAccuracy(mom) {
  if (!mom) mom = moment()
  return moment(mom.format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate()
}
//------ end to remove


module.exports = () =>

function(existingUser, session) {

  var emptyMongooseCohort = { maillists: [], aliases: [], engagement: { visits: [] } }

  var cohort = (existingUser) ? existingUser.cohort : null
  cohort = cohort || {}
  if (_.isEqual(cohort,emptyMongooseCohort)) cohort = {}
  // if (true) $log('getCohortProperties'.cyan, cohort)

  var now         = new Date()
  var day         = dateWithDayAccuracy()
  var visit_first = existingUser ? ObjectId2Date(existingUser._id) : momentSessionCreated(session).toDate()
  var visit_signup = existingUser ? ObjectId2Date(existingUser._id) : now

  if (!cohort.engagement)
    cohort.engagement = {visit_first,visit_signup,visit_last:now,visits:[day]}
  if (!cohort.engagement.visit_first)
    cohort.engagement.visit_first = visit_first
  if (!cohort.engagement.visit_signup)
    cohort.engagement.visit_signup = visit_signup
  if (!cohort.engagement.visit_last)
    cohort.engagement.visit_last = now
  if (!cohort.engagement.visits || cohort.engagement.visits.length == 0)
    cohort.engagement.visits = [day]


  if (!cohort.firstRequest && session.firstRequest)
    cohort.firstRequest = session.firstRequest

  // if (!cohort.aliases)   // we add the aliases after successful sign up
    // cohort.aliases = []  // This could probably make more sense

  return cohort

}

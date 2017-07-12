module.exports = {

  TYPE: ['post','workshop','expert', 'tag'],

  USER: {
    SCOPES: ['admin','spinner','pipeliner','post:editor','post:moderator','expert:trusted','expert:approved'],
    EMAIL_SOURCE: ['manual:input','oauth:github','oauth:google','connect:company'],
    EMAIL_CONVERT_TYPE: ['open','click','goal']
  },

  TEAM: {
    STATUS: ['active','inactive'],
    TYPE:   ['department','project','adhoc'],
    SCOPES: ['billing','book','purchase']
  },

  ORG: {
    TYPE:   ['startup','smb','enterpise','solo','charity']
  },

  EXPERT: {
    AVAILABILITY: ['busy','ready'],
    SCOPES:       ['expert:trusted','expert:approved']
  }

}

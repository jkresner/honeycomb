module.exports = {

  AUTH: {
    USER: {
      EMAIL_SOURCE: ['manual:input','oauth:github','oauth:google','oauth:facebook','connect:company'],
      EMAIL_CONVERT_TYPE: ['open','click','goal']
    },
    TEAM: {
      STATUS: ['active','inactive'],
      TYPE:   ['department','project','adhoc']
    },
    ORG: {
      TYPE:   ['startup','smb','enterpise','solo','charity']
    }
  }

}

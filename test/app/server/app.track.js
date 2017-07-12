
module.exports = ({select,assign,inflate,chain}) => ({

  loginPassword: r => ['login', assign({type:'local:password'},select(r.user,'name'))],

  githubOAuth: r => [r.user?'oauth:gh:link':'login', select(r.user.auth.gh,'name logic id followers')],

  linkedinOAuth: r => [r.user?'oauth:in:link':'login', select(r.user.auth.in,'id')],

  stackoverflowOAuth: r => [r.user?'oauth:so:link':'login', select(r.user.auth.so,'user_id display_name reputation')],

})

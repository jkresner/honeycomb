module.exports = () =>

function() {}

// module.export = {

//   collateEmails(existing, linked) {
//     // if (existing.length > 0)
//     //   $log(`ap[${existing.length}]emails`.yellow, existing)

//     var detected = []

//     for (var linkedProfile of _.values(linked)) {
//       var {provider,emails} = linkedProfile
//       if (provider == 'github') {
//         //-- need to do network call to grab latest emails ...

//         if (!emails || emails.length == 0)
//           $log(`gh[0]emails`.red)
//         else
//           detected = _.union(detected, _.map(emails,(em)=>_.extend({origin:'oauth:github'},em) ))
//       }
//       else if (provider == 'google') {
//         if (!emails || emails.length == 0)
//           $log(`gp[0]emails`.red)
//         else
//           detected = _.union(detected, _.map(emails,(em)=>_.extend({origin:'oauth:google'},em) ))
//       }
//     }

//     var existingPrimary = _.find(existing,(em)=>em.primary)

//     for (var email of detected)
//     {
//       var {value,origin} = email
//       var valid = value != null && value != ''
//       // $log('detected'.blue, existing, valid, origin, value)
//       if (valid && !_.find(existing,(em)=>em.value==value)) {
//         var newEmail = {value,origin,verified:true}
//         if ( !existingPrimary &&
//               detected.length == 1 ||
//              (origin == 'oauth:github' && email.primary) )
//             newEmail.primary = true
//         // $log('newEmail'.yellow, newEmail)
//         existing.push(newEmail)
//       }
//     }

//     if (!_.find(existing,(em)=>em.primary))
//       existing[0].primary = true

//     return existing
//   }

// }

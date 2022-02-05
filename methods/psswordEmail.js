/**
 *
 * Run:
 *
 */
 const mailjet = require('node-mailjet').connect(
    "07ee3e1ebfd68d2597cbee669e08d1fb",//api key
    "5aa1f08951146a8ec55954ef9b657112"//secreat key
  )
  
  module.exports = function(email,token ,callback)
  {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'dhamijashivam24@gmail.com',
            Name: 'Email Verify',
          }, 
          To: [
            {
              Email: email,
              Name: 'Nama ma kya rkha h',
            },
          ],
          Subject: 'Mail verification',
          TextPart: 'password verification',
          HTMLPart: `<h1>change new password</h1>
          <br/>
          <img src="https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=85"/>
          <br/>  
          <a href="http://localhost:3000/verifyPasswordMail/${token}"> Change Password !!!!</a>
          `/*a m panga h kyoki local host kese check karo */
        },
      ],
    })
  
  
    request
      .then(result => {
        console.log(result.body)
        callback(null, result.body)
      })
      .catch(err => {
        console.log(err);
        callback(err, null)
  
      })
  }
  
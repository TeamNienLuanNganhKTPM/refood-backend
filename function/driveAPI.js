// //GOOGLEDRIVE
// const { google } = require('googleapis');
// const fs = require('fs')
// const GOOGLE_DRIVE_CLIENT_ID = `438338719524-k0bmchdtihvlbh5bnh2rmpls1m51pk4f.apps.googleusercontent.com`
// const GOOGLE_DRIVE_CLIENT_SECRET = `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`
// const GOOGLE_DRIVE_REDIRECT_URI = `https://developers.google.com/oauthplayground`
// const GOOGLE_DRIVE_REFRESH_TOKEN = `1//04XRea9CkCWj6CgYIARAAGAQSNwF-L9IrNQyOkTW9f_q1h2rc9B15zVwsT1UHwPMvxHNwHdH_93FT_D33vG0ZZVFiNWfcoajYsw8`
// const GOOGLE_DRIVE_FOLDER_ID = `1Joq74uis77FzXb8kjjXbxP9gTcrGvZQM`
// const oauth2Client = new google.auth.OAuth2(
//     GOOGLE_DRIVE_CLIENT_ID,
//     GOOGLE_DRIVE_CLIENT_SECRET,
//     GOOGLE_DRIVE_REDIRECT_URI
// );
// const drive = google.drive({
//     version: 'v3',
//     auth: oauth2Client,
// });
// oauth2Client.setCredentials({ refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN })

// const uploadImage = async (image) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let fileName = image.name
//             const resource = {
//                 name: fileName,
//                 mimeType: image.mimetype,
//                 title: image.name,
//             };
//             const media = {
//                 mimeType: image.mimetype,
//                 body: fs.createReadStream(image.tempFilePath)
//             };
//             await drive.files.create({
//                 resource,
//                 media,
//                 fields: 'id'
//             })
//                 .then(async (data) => {
//                     if (data.data.id != null && data.data.id != undefined) {
//                         try {
//                             await drive.files.update({
//                                 fileId: data.data.id,
//                                 addParents: GOOGLE_DRIVE_FOLDER_ID,
//                                 fields: 'id',
//                             }).then((data) => {
//                                 if (data.data.id != null && data.data.id != undefined)
//                                     resolve(data.data.id)
//                                 else
//                                     reject(false)
//                             });
//                         } catch (err) {
//                             reject(false)
//                         }
//                     }
//                     else
//                         reject(false)
//                 })
//                 .catch((err) => {
//                     reject(false)
//                 })
//         } catch (error) {
//             reject(false)
//         }
//     })
// }

// module.exports = { uploadImage, GOOGLE_DRIVE_FOLDER_ID }
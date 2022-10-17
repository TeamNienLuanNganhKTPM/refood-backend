//GOOGLEDRIVE
const { google } = require('googleapis');
const fs = require('fs')
//Email: service.refood@gmail.com
const GOOGLE_DRIVE_CLIENT_ID = `42778963400-vnuhirma3obgiajfjq4ddilb54rkequv.apps.googleusercontent.com`
const GOOGLE_DRIVE_CLIENT_SECRET = `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`
const GOOGLE_DRIVE_REDIRECT_URI = `https://developers.google.com/oauthplayground`
const GOOGLE_DRIVE_REFRESH_TOKEN = `1//049cNY-sg9QLQCgYIARAAGAQSNwF-L9IrZGfXm_AXO4Y6guRG6-hF1b2TbGmeo7pxUiom8A3IfACw-HaRChto89WPO_wZ-MywrFM`
const GOOGLE_DRIVE_FOLDER_ID = `1QSShxP6cf3D4WBdjUATKFEvU10ZX9XON`
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI
);
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});
oauth2Client.setCredentials({ refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN })

const uploadImage = async (image) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fileName = image.name
            const resource = {
                name: fileName,
                mimeType: image.mimetype,
                title: image.name,
            };
            const media = {
                mimeType: image.mimetype,
                body: fs.createReadStream(image.tempFilePath)
            };
            await drive.files.create({
                resource,
                media,
                fields: 'id'
            })
                .then(async (data) => {
                    if (data.data.id != null && data.data.id != undefined) {
                        try {
                            await drive.files.update({
                                fileId: data.data.id,
                                addParents: GOOGLE_DRIVE_FOLDER_ID,
                                fields: 'id',
                            }).then((data) => {
                                if (data.data.id != null && data.data.id != undefined)
                                    resolve(data.data.id)
                                else
                                    reject(false)
                            });
                        } catch (err) {
                            reject(false)
                        }
                    }
                    else
                        reject(false)
                })
                .catch((err) => {
                    console.log(err)
                    reject(false)
                })
        } catch (error) {
            reject(false)
        }
    })
}

module.exports = { uploadImage, GOOGLE_DRIVE_FOLDER_ID }
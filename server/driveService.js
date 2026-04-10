const { google } = require('googleapis');
const stream = require('stream');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const driveService = {
    setCredentials: (tokens) => {
        oauth2Client.setCredentials(tokens);
    },

    uploadFile: async (fileBase64, fileName, mimeType, folderId) => {
        try {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(Buffer.from(fileBase64, 'base64'));

            const response = await drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: mimeType,
                    parents: folderId ? [folderId] : []
                },
                media: {
                    mimeType: mimeType,
                    body: bufferStream
                }
            });

            const fileId = response.data.id;

            // Set permissions to "Anyone with the link can view"
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            // Get the shareable URL
            const file = await drive.files.get({
                fileId: fileId,
                fields: 'webViewLink, webContentLink, thumbnailLink'
            });

            return {
                driveFileId: fileId,
                viewUrl: file.data.webViewLink,
                downloadUrl: file.data.webContentLink,
                thumbnailUrl: file.data.thumbnailLink
            };
        } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
            throw error;
        }
    },

    deleteFile: async (fileId) => {
        try {
            await drive.files.delete({ fileId: fileId });
        } catch (error) {
            console.error('Error deleting file from Google Drive:', error);
            throw error;
        }
    },

    getAuthUrl: () => {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive.file']
        });
    },

    getToken: async (code) => {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    }
};

module.exports = driveService;

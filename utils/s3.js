// const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');

// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

// exports.uploadToS3 = async (file) => {
//     const params = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `${uuidv4()}-${file.originalname}`,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: 'private'
//     };

//     const { Location } = await s3.upload(params).promise();
//     return Location;
// };

// exports.getSignedUrl = async (fileUrl) => {
//     const key = fileUrl.split('/').pop();
//     const params = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: key,
//         Expires: 60 * 5 // URL expires in 5 minutes
//     };

//     return s3.getSignedUrlPromise('getObject', params);
// };
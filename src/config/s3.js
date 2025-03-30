const AWS = require('aws-sdk');
const logger = require('./logger');

const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET,
  endpoint: process.env.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
};

const s3 = new AWS.S3(s3Config);

// Проверка подключения
const checkConnection = async () => {
  try {
    await s3.listBuckets().promise();
    logger.info('AWS S3 Connected');
    return true;
  } catch (error) {
    logger.error(`AWS S3 Connection Error: ${error.message}`);
    return false;
  }
};

// Загрузка файла
const uploadFile = async (file, key) => {
  try {
    const params = {
      Bucket: s3Config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded successfully: ${key}`);
    return result.Location;
  } catch (error) {
    logger.error(`File upload error: ${error.message}`);
    throw error;
  }
};

// Удаление файла
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: s3Config.bucket,
      Key: key
    };

    await s3.deleteObject(params).promise();
    logger.info(`File deleted successfully: ${key}`);
  } catch (error) {
    logger.error(`File deletion error: ${error.message}`);
    throw error;
  }
};

// Получение временной ссылки
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: s3Config.bucket,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    logger.error(`Signed URL generation error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  s3Config,
  s3,
  checkConnection,
  uploadFile,
  deleteFile,
  getSignedUrl
}; 
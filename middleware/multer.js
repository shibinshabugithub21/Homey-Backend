
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const upload = multer();
const s3 = new S3Client({
    region: process.env.AWS_S3_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_S3_ACCESS_KEY, 
    },
});

function s3UploadMiddleware(req, res, next) {
  console.log("multer");
  
    upload.single('icon')(req, res, async (err) => {
        if (err) {
          console.log("1");
            return res.status(500).json({ error: 'File upload error', details: err.message });
        }
        console.log("2");

        if (!req.file) {
          console.log("3");

            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log("4");

        try {
          console.log("5");

            // Prepare S3 upload params
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME, // Get bucket name from environment variable
                Key: `images/${Date.now()}_${req.file.originalname}`, // Create a unique key using timestamp
                Body: req.file.buffer, // File data
                ContentType: req.file.mimetype, // File MIME type
            };
            console.log("6");

            // Upload the file to S3
            const command = new PutObjectCommand(uploadParams);
           let  a =  await s3.send(command);

           console.log(command)
           console.log(a)

            // Add the S3 file URL to the request object for further use
            req.url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${uploadParams.Key}`;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Image upload failed', details: error.message });
        }
    });
}

module.exports =s3UploadMiddleware
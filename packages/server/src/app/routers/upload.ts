import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
    // Adjust storage configuration as needed
    destination: 'public/images',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

export default (router: Router) => {
    // eslint-disable-next-line consistent-return
    router.post('/upload', upload.array('files'), (req, res) => {
        try {
            const uploadedFiles = req.files as Express.Multer.File[]; // Type casting

            if (!uploadedFiles) {
                return res.status(400).json({ message: 'No images uploaded' });
            }

            const imageUrls = uploadedFiles.map((file) => {
                // Generate image URLs based on your storage strategy
                // (e.g., URLs for cloud storage or local paths)
                return file.filename;
            });

            res.status(200).json({
                message: 'Images uploaded successfully',
                imageUrls,
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};

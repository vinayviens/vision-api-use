const express = require('express');
const { JWT } = require('google-auth-library');
const vision = require('@google-cloud/vision');
const multer = require('multer');
const key = require('./key.json');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));

const client = new vision.ImageAnnotatorClient({
  credentials: key,
  authClient: new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  }),
});

app.get('/', (req, res) => {
    res.render('index',);
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.textDetection(req.file.path);
        const detections = result.textAnnotations;

        res.render("result", {
            fulltext: detections.length ? detections[0].description : "No text detected",
            words: detections.slice(1).map((d) => d.description),
        });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image');
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
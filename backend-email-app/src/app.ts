import express from 'express';
import bodyParser from 'body-parser';
import { setContactRoutes } from './routes/contactRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

setContactRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import { Router } from 'express';
import EmailController from '../controllers/emailController';

const router = Router();
const emailController = new EmailController();

export function setContactRoutes(app) {
    app.use('/api/contact', router);
    router.post('/', emailController.sendEmail.bind(emailController));
}
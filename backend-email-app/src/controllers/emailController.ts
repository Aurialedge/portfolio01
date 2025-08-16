import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

class EmailController {
    async sendEmail(req: Request, res: Response) {
        const { name, email, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Contact Form Submission from ${name}`,
            text: message,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to send email', error });
        }
    }
}

export default new EmailController();
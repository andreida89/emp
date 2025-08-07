import nodemailer from 'nodemailer';
import logger from './logger';

class Mailer {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.init();
	}

	private init() {
		this.transporter = nodemailer.createTransport({
			host: 'smtp.zoho.eu',
			port: 465, // Use 465 for SSL, or switch to 587 for TLS
			secure: true, // Must be true for SSL (false for TLS on port 587)
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS
			},
			tls: {
				rejectUnauthorized: false // Helps with SSL verification issues
			}
		});

		this.transporter.verify((error) => {
			if (error) {
				logger.error(`Email Transporter Error: ${error.message}`);
				console.log(`[EMAIL ERROR]: ${error.message}`);
			} else {
				logger.success('Email server ready.');
				console.log('[EMAIL] Transporter ready.');
			}
		});
	}

	send(email: string, subject: string, text: string) {
		const mailOptions = {
			from: process.env.MAIL_USER,
			to: email,
			subject: subject,
			text: text
		};

		this.transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				logger.error(`Email sending failed: ${error.message}`);
				console.log(`[EMAIL ERROR] Sending failed: ${error.message}`);
			} else {
				logger.success(`Email sent to ${email}: ${info.messageId}`);
				console.log(`[EMAIL] Sent to ${email} | MessageID: ${info.messageId}`);
			}
		});
	}
}

const mailer = new Mailer();
export default mailer;
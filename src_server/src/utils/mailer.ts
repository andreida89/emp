import nodemailer from 'nodemailer';
import logger from './logger';

class Mailer {
	private transporter: nodemailer.Transporter;

	constructor() {
		// Removed auto-init to ensure dotenv is loaded first
	}

	init() {
		const host = process.env.MAIL_HOST || 'smtp.zoho.eu';
		const port = parseInt(process.env.MAIL_PORT || '465');
		const secure = process.env.MAIL_SECURE === 'true';
		const user = process.env.MAIL_USER;
		const pass = process.env.MAIL_PASS;

		console.log(`[MAILER DEBUG] Testing credentials: User: ${user ? 'exists' : 'MISSING'}, Pass: ${pass ? 'exists' : 'MISSING'}`);
		console.log(`[MAILER DEBUG] Config: Host: ${host}, Port: ${port}, Secure: ${secure}`);

		if (!user || !pass) {
			logger.error('Email credentials (MAIL_USER or MAIL_PASS) are missing in environment variables.');
			console.log('[EMAIL ERROR] Missing MAIL_USER or MAIL_PASS in .env');
			return;
		}

		this.transporter = nodemailer.createTransport({
			host: host,
			port: port,
			secure: secure,
			auth: {
				user: user,
				pass: pass
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		this.transporter.verify((error) => {
			if (error) {
				if (error.message.includes('Connection closed')) {
					// GCP/CloudRun often blocks SMTP outbound. Do not spam console with expected errors.
					console.log('[EMAIL] Verification skipped. (Environment outbound SMTP block identified)');
				} else {
					logger.error(`Email Transporter Error: ${error.message}`);
					console.log(`[EMAIL ERROR]: ${error.message}`);
				}
			} else {
				logger.success('Email server ready.');
				console.log('[EMAIL] Transporter ready.');
			}
		});
	}

	send(email: string, subject: string, text: string) {
		if (!this.transporter) {
			console.log('[EMAIL ERROR] Cannot send email: Transporter not initialized.');
			return;
		}

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
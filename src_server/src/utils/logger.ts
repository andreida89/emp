import winston from 'winston';
import chalk from 'chalk';

const options = {
	file: {
		level: 'info',
		filename: 'logs/app.log',
		json: true
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: false,
		colorize: true
	}
};

const { combine, printf } = winston.format;
const logFormat = printf((info) => {
	return `[${info.timestamp}]: ${info.message}`;
});

class Logger {
	create(name: string) {
		const logger = winston.createLogger({
			transports: [
				new winston.transports.Console(options.console),
				new winston.transports.File({ ...options.file, filename: `logs/${name}.log` })
			],
			format: combine(
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.splat(),
				winston.format.simple(),
				logFormat
			)
		});

		return logger;
	}

	error(message: string) {
		console.log(chalk.red('[ERROR] ') + message);
	}

	success(message: string) {
		console.log(chalk.green('[DONE] ') + message);
	}

	info(message: string) {
		console.log(chalk.blue('[INFO] ') + message);
	}
}

export default new Logger();

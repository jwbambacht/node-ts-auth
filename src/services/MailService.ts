import { Container, Service } from 'typedi';
import * as ejs from 'ejs';
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { LoggerService } from "./LoggerService";
import path from "path";

@Service()
export class MailService {
    log = Container.get(LoggerService);
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    settings = {
        host: process.env.NODEMAILER_HOST,
        port: Number(process.env.NODEMAILER_PORT),
        secure: process.env.NODEMAILER_SECURE === 'true',
        requireTLS: process.env.NODEMAILER_TLS === 'true',
        auth: {
            user: process.env.NODEMAILER_USERNAME,
            pass: process.env.NODEMAILER_PASSWORD,
        },
        logger: process.env.NODEMAILER_LOGGING === 'true'
    }

    constructor() {

        if (this.settings.host === '' || this.settings.auth.user === '' || this.settings.auth.pass === '') {
            this.log.error('MailService misses host, username or password');
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            this.log.info("MAIL IN DEVELOPMENT");
            nodemailer.createTestAccount().then((account) => {
                this.settings.host = 'smtp.ethereal.email';
                this.settings.port = 587;
                this.settings.secure = false;
                this.settings.requireTLS = true;
                this.settings.auth.user = account.user;
                this.settings.auth.pass = account.pass;
                this.transporter = nodemailer.createTransport(this.settings);
            });

        } else {
            this.transporter = nodemailer.createTransport(this.settings);
        }
    }

    /**
     * Create the HTML from a predefined template to send a mail
     * @param template name of template in directory src/views/mail without the .ejs extension
     * @param recipient email-address of recipient
     * @param subject subject of the email
     * @param data required data that is used within the template in json format
     */
    public sendMailUsingTemplate(template: string, recipient: string, subject: string, data: object): void {
        ejs.renderFile(path.join(__dirname, "../../src/views/mail/") + template + ".ejs", data).then((html) => {
            this.sendMail(recipient, subject, html);
        });
    }

    /**
     * Send a mail with plain HTML without a template
     * @param recipient email-address of recipient
     * @param subject subject of the email
     * @param html HTML of the email
     */
    public sendMail(recipient: string, subject: string, html: string): void {
        this.transporter.sendMail({
            to: recipient,
            subject: subject,
            html: html
        }).then(info => {
            this.log.info('Email successfully sent');

            if (process.env.NODE_ENV === 'development') {
                this.log.info(nodemailer.getTestMessageUrl(info) as string);
            }
        });
    }
}
const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice'); // convert and inline css
const htmlToText = require('html-to-text');
const promisfy = require('es6-promisify');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST, 
    port: process.env.MAIL_PORT, 
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS
    }
});

const generateHTML = (filename, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options); // __dirname will show us what directory we are presently iin
    console.log(html);
    const inlined = juice(html);
    return inlined;
}

exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);

    const mailOptions = {
        from: `Felicia Brenner <noreply@febren.com>`,
        to: options.user.email, 
        subject: options.subject, html,
        text,
    };
   const sendMail = promisfy(transport.sendMail, transport); 
   return sendMail(mailOptions);
}


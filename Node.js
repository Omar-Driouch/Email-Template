const fs = require('fs');
const nodemailer = require('nodemailer');
const readline = require('readline');
const path = require('path');

const smtpServer = 'smtp.gmail.com';
const smtpPort = 587;
const senderEmail = 'omardriouch29@gmail.com';
const senderName = 'Omar Driouch';
const subject = 'Software Developer';
const emailInterval = 10;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your email password (will not be displayed): ', (password) => {
  rl.close();

  const recipientEmails = fs
    .readFileSync('recipient_email.txt', 'utf8')
    .split('\n')
    .filter(email => email.trim() !== '');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: password
    }
  });

  const extractRecipientName = (email) => {
    const match = email.match(/(.+?)(?=@|\d)/);
    if (match && match[1]) {
      const modifiedName = match[1].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return modifiedName;
    }
    return email;
  };

  const sendEmails = async () => {
    for (const recipientEmail of recipientEmails) {
      if (!isEmailSent(recipientEmail)) {
        const recipientName = extractRecipientName(recipientEmail);
        const personalizedMessage = fs.readFileSync('message.html', 'utf8').replace('[Recipient\'s Name]', recipientName);

        const mailOptions = {
          from: `"${senderName}" <${senderEmail}>`,
          to: recipientEmail,
          subject: subject,
          html: personalizedMessage,
          attachments: getAttachments()
        };

        try {
          await sendEmail(transporter, mailOptions);
          markEmailAsSent(recipientEmail);
          console.log(`Email sent successfully to ${recipientEmail} (${recipientName})!`);
        } catch (error) {
          console.error(`Error sending email to ${recipientEmail}:`, error);
        }
      } else {
        console.log(`Email to ${recipientEmail} has already been sent. Skipping.`);
      }

      await sleep(emailInterval);
    }

    console.log('All emails sent. Script completed.');
    process.exit(0);
  };

  sendEmails();

  console.log('Email automation script is running. Press Ctrl+C to exit.');
});

function getAttachments() {
  const attachmentFolderPath = path.join(__dirname, 'Attached_Docs');

  const attachments = fs.readdirSync(attachmentFolderPath).map((fileName) => ({
    path: path.join(attachmentFolderPath, fileName),
    filename: fileName
  }));

  return attachments;
}

function isEmailSent(email) {
  const sentEmails = fs.readFileSync('sent_emails.txt', 'utf8').split('\n');
  return sentEmails.includes(email);
}

function markEmailAsSent(email) {
  fs.appendFileSync('sent_emails.txt', email + '\n');
}

function sendEmail(transporter, mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

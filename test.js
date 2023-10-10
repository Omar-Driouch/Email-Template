const fs = require('fs');
const nodemailer = require('nodemailer');
const readline = require('readline');

const smtpServer = 'smtp.gmail.com';
const smtpPort = 587;
const senderEmail = 'omardriouch29@gmail.com'; 
const senderName = 'Omar Driouch'; // Replace 'Your Name' with the desired "from" name
const subject = 'Software Developer';
const cvAttachmentPath = './Omar driouch Cv.pdf'; 
const emailInterval = 5000; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your email password (will not be displayed): ', (password) => {
  rl.close();

  const recipientEmails = fs
    .readFileSync('recipient_emails.txt', 'utf8')
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

  const sendEmail = (recipientEmail) => {
    const recipientName = extractRecipientName(recipientEmail);
    
    // Read the HTML message from the message.html file
    const personalizedMessage = fs.readFileSync('message.html', 'utf8').replace('[Recipient\'s Name]', recipientName);

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`, // Set the "from" name and email
      to: recipientEmail,
      subject: subject,
      html: personalizedMessage, // Use HTML format for the message
      attachments: [
        {
          path: cvAttachmentPath
        }
      ]
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(`Error sending email to ${recipientEmail}:`, error);
      } else {
        console.log(`Email sent successfully to ${recipientEmail} (${recipientName})!`);
      }
      
      sendNextEmailWithDelay();
    });
  };

  let currentIndex = 0;

  const sendNextEmailWithDelay = () => {
    if (currentIndex < recipientEmails.length) {
      sendEmail(recipientEmails[currentIndex]);
      currentIndex++;
    } else {
      console.log('All emails sent. Script completed.');
      process.exit(0); 
    }
  };

  sendNextEmailWithDelay();

  console.log('Email automation script is running. Press Ctrl+C to exit.');
});

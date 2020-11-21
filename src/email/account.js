const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
//     to: 'andreidarie84@gmail.com',
//     from: 'andreidarie84@gmail.com',
//     subject: 'Test email',
//     text: 'Test email text'
// }).then(() => {
//     console.log('Success');
// }).catch((error) => {
//     console.log(error);
// });

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: 'andreidarie84@gmail.com',
        from: 'andreidarie84@gmail.com',
        subject: 'Test email',
        text: `Test signup email text - ${name}`
    }).then(() => {
        console.log('Success');
    }).catch((error) => {
        console.log(error);
    });
};

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: 'andreidarie84@gmail.com',
        from: 'andreidarie84@gmail.com',
        subject: 'Test email',
        text: `Test cancel email text - ${name}`
    }).then(() => {
        console.log('Success');
    }).catch((error) => {
        console.log(error);
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}
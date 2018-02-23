// routed here when user forgets his password

const sendMessage = require('./handler/sendOTP');
const Models = require('../models');
const forgetPasswordSwagger = require('../swagger/routes/forgetpassword');
const verifyOTPSwagger = require('../swagger/routes/verifyOTP');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

function hashPassword(password, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (_, hash) => cb(err, hash));
  });
}

const getUserData = userName => new Promise((resolve) => {
  // const userInfo = {};()
  Models.users.findOne({ where: { userName } }) // Get userId for give username
    .then((userObject) => {
      Models.userDetails.findOne({ where: { userId: userObject.userId } })
        .then((item) => {
          resolve({
            userId: item.userId,
            userName,
            phone: item.phone,
            oldPassword: userObject.password,
          });
        });
    });
});

const otpDB = (userId, otp) => new Promise((resolve) => {
  Models.forgotpasswords.create({
    userId,
    otp,
    timestamp: Date.now().toString(),
  }).then(() => {
    resolve();
  });
});

const timedout = (timestamp) => {
  const currentTime = Date.now();
  const timeDifference = (currentTime - timestamp) / 1000;
  if (timeDifference > 300) {
    return true; // request is timedout
  }

  return false; // request still active
};

const sendOTP = (phone) => {
  // send otp to mobile here
  const otp = sendMessage(phone);
  return otp;
};

const verifyOTP = (userInfo, otpEntry, rcvdOTP) => new Promise((resolve) => {
  if (otpEntry.otp === parseInt(rcvdOTP) && !timedout(otpEntry.timestamp)) {
    const newPassword = Math.random().toString(36).slice(-8);
    const userInfoNew = {
      userId: userInfo.userId,
      userName: userInfo.userName,
    };
    // updating DB
    hashPassword(newPassword, (_, hashedPassword) => {
      Models.users.update(
        { password: hashedPassword },
        { where: { userId: userInfoNew.userId } },
      ).then(() => {
        resolve('Password successfully reset', newPassword);
      })
        .catch((err) => {
          console.log(err);
        });
    });
  } else if (!timedout(otpEntry.timestamp)) { // otp is wrong
    resolve('OTP is wrong, please try again');
  } else { // otp expired
    resolve('Request Timed out');
  }
});

module.exports = [{
  method: 'POST',
  path: '/forgetPassword',
  config: {
    auth: 'jwt',
    tags: ['api'],
    description: 'Registers a request for password reset',
    notes: 'Sends OTP for password reset for valid userName',
    plugins: {
      'hapi-swagger': forgetPasswordSwagger,
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        userName: Joi.string().min(5).max(15).regex(/^[a-z][a-z0-9_]*$/i)
          .example('John_Doe'),
        userId: Joi.number().integer().example(1),
      }),
    },
  },
  handler: (req, reply) => { // sends OTP to user
    const { userName } = req.auth.credentials;
    getUserData(userName).then((userInfo) => {
      sendOTP(userInfo.phone).then((otp) => {
        otpDB(userInfo.userId, otp).then(() => {
          reply('OTP sent on registered mobile');
        });
      });
    });
  },
},
{
  method: 'POST',
  path: '/verifyOTP',
  config: {
    auth: 'jwt',
    tags: ['api'],
    description: 'Verifies OTP and resets password for valid OTP',
    plugins: {
      'hapi-swagger': verifyOTPSwagger,
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        userName: Joi.string().min(5).max(15).regex(/^[a-z][a-z0-9_]*$/i)
          .example('John_Doe'),
        otp: Joi.number().integer().min(100000).max(999999),
      }),
    },
  },
  handler: (req, reply) => {
    const rcvdOTP = req.payload.otp;
    const userInfo = req.auth.credentials;
    Models.forgotpasswords.findAll({ // Get latest otp info
      where: { userId: userInfo.userId },
      limit: 1,
      order: [['createdAt', 'DESC']],
    }).then((entry) => {
      const otpEntry = entry[0].dataValues;
      verifyOTP(userInfo, otpEntry, rcvdOTP)
        .then((response) => {
          reply(response);
        });
    });
  },
}];
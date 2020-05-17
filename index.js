require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./backend/models/user');
const UserFile = require('./backend/models/userFile');
const auth = require('./backend/middleware/auth');
const PasswordResetToken = require('./backend/models/resetToken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

// console.log(path.resolve(process.cwd(), 'dev.env'))
const log4js = require('log4js');
log4js.configure({
    appenders: { book: { type: 'file', filename: 'logs/classifier_be.log' }, out: { type: 'stdout' } },
    categories: { default: { appenders: ['book', 'out'], level: 'debug' } }
});
const logger = log4js.getLogger('book');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "PUT,DELETE, POST, GET, OPTIONS"
    )
    next();
});

app.use(cors());
app.use("/uploads", express.static(path.join("backend/uploads")));

app.post('/users/signUp', async (req, res, next) => {
    const user = new User(req.body)
    try {
        user.password = await bcrypt.hash(user.password, 8);
        await user.save();
        const tokenData = await user.generateAuthToken();
        res.status(201).send({
            user: user,
            token: tokenData.token,
            expiresIn: tokenData.expiresIn
        });
    } catch (err) {
        if (11000 === err.code) {
            res.send("User already registered! Please login");
        }
        logger.error('Error in registering', err);
        res.send("Error in registering!");
    }
});

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const tokenData = await user.generateAuthToken();
        res.status(200).json({ 
            user:user,
            token:tokenData.token,
            expiresIn: tokenData.expiresIn,
            userId: tokenData.userId
        })

    }catch (e) {
        res.send("Login with valid credentials!");
        logger.error('Error', e);
    }
})

app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        logger.error(e);
        res.send("Error occured");
    }
})

app.post('/users/requestResetPassword', async(req, res) => {
    if(!req.body.email) {
        res.status(500).send("Email is required");
    }

    const user = await User.findOne({email: req.body.email}, async(err, user) => {
        if(!user) {
            res.status(409).send("user not exists")
        }

        const resetToken = new PasswordResetToken({userId: user._id, resetToken: crypto.randomBytes(12).toString('hex')});
        resetToken.save((err) => {
            if(err) {
                res.status(500).send(err);
            }
            PasswordResetToken.findOne({userId: user._id, resetToken: {$ne: resetToken.resetToken}}).deleteMany().exec();
            res.status(200).json({ 
                message:'Reset password successfully'
            });

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            logger.info("resetToken ", resetToken.resetToken)
            let msg = {
                to: user.email,
                from: 'jeniclin01@gmail.com',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://localhost:4200/responseToReset/' + resetToken.resetToken + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            }
            sgMail.send(msg).then(() => {
                console.log('Message sent')
            }).catch((error) => {
                console.log("error in sending mail",error)
            })
        });
    })
})

app.post('/validatePasswordToken', async(req, res) => {
    if (!req.body.resetToken) {
        return res
        .status(500)
        .send('Token is required');
        }
        const user = await PasswordResetToken.findOne({

            resetToken: req.body.resetToken
        });
        if (!user) {
            logger.error("invalid url");
        return res
        .status(409)
        .send('Invalid URL');
        }
        User.updateOne({ _id: user.userId }).then(() => {
        res.status(200).json({ message: 'Token verified successfully.' });
        }).catch((err) => {
        return res.status(500).send(err);
        });
})
 app.post('/users/setNewPassword', async(req, res) => {
    PasswordResetToken.findOne({ resetToken: req.body.resetToken },(err, userToken, next) => {
        if (!userToken) {
            logger.error('Token has expired')
          return res
            .status(409)
            .send('Token has expired');
        }
  
        User.findOne({ _id: userToken.userId}, async(err, user, next) => {
          if (!user) {
              logger.error('User does nit exits')
            return res
              .status(409)
              .send('User does not exist');
          }
            user.password = await bcrypt.hash(req.body.password, 8);
            await user.save((err) => {
                console.log("user is", user)
                if(err){
                    logger.error('Password cannot reset');
                    return res.status.send("Password cannot reset")
                }
                else {
                    userToken.remove();
                    logger.info('Password reset successfullly')
                    return res.status(200).json({message:"Password reset successfullly"})
                }
            });
        })
    })   
})

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/uploads');
    }
});
app.post('/upload', multer({ storage: storage }).single('userFile'), auth, async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    console.log("userId", req.userData._id)
    try {
        if (!req.file) {
            console.log("No file received");
            return res.send({
                success: false
            });

        } else {
            console.log('file received successfully');
            const userFile = new UserFile({
                name: req.file.originalname.toLowerCase(),
                createdDate: Date.now(),
                modifiedDate: Date.now(),
                size: req.file.size,
                extension: req.file.mimetype,
                filePath: url + "/uploads/" + req.file.filename,
                creator: req.userData._id
                });
            userFile.save()
            res.status(200).json({
                message: "user file uploaded successfully",
                userfile: userFile
            })
            console.log("userfile is ",userFile)
        }
    } catch (e) {
        logger.error(e);
        res.send("Error in uploading file")
    }
})

app.get('/uploadedfiles',auth, async(req, res, next) => {
    await UserFile.find({creator: req.userData._id},(err, files) => {
        if(err){
            logger.error('Error in retreiving files from database');
            res.status(201).send("Error in retreival of files")
        }
        else {
            console.log("files are", files)
            res.status(200).json({
                message: "Files retreived successfully",
                files: files
            })
        }

    }).sort({createdDate: -1})
})

app.get('/files/:id', auth, async(req, res, next) => {
    await UserFile.findById({_id: req.params.id}, (err, file) => {
        if(err) {
            res.status(201).send("error in getting file")
            logger.error('Error in getting file', err.message);
        }
        else {
            console.log("file is",file)
            res.status(200).json({
                "fileObject": file
            })
        }
    })
})

app.get('/recentFiles', auth, async(req, res, next) => {
    const files = await UserFile.find({creator: req.userData._id}).sort({modifiedDate: -1}).limit(10);
    res.status(200).send({
        files: files
    })
})

app.put('/files/:id', auth, async(req, res, next) => {
    await UserFile.updateOne({_id: req.params.id, creator: req.userData._id}, {$set: {name: req.body.finalName}}, (err, result) => {
        if(err) {
            res.status(201).json({
                message: "error in renaming file"
            })
            logger.error('Error in renaming file', err.message);
        }
        else {
            if(result.nModified > 0) {
                res.status(200).json({
                    "message": "file is updated",
                    "updatedFile": result
                })
            }
            else{
                res.status(401).send("Not authorized")
            }
        }
    })
})

app.delete('/files/:id', auth, async(req, res) => {
let fileName = '';
let filePath ='';
    await UserFile.findById({_id: req.params.id}, (err, file) => {
        filePath = file.filePath
        fileName = filePath.replace('http://127.0.0.1:3000', '');
    })
    await UserFile.deleteOne({_id: req.params.id, creator: req.userData._id}, (err, result) => {
        if(err) {
            res.status(201).send("Error in deleting file")
            logger.error("Error in deleting", err.message);
        }
        else {
            if(result.n > 0) {
                fs.unlink('./backend' + fileName, (err, result) => {
                    if(err) {
                        message: err.message
                    }
                    else {
                        message: "file deleted in directory"
                    }
                })
                console.log("deleted file", result)

                res.status(200).json({
                    "message": "File was deleted"
                })
            }
            else{
                res.status(401).send("Not authorized")
            }
        }
    })
})

// app.use('/users', (req, res) => {
//     res.status(200).send("testing")
// })
const port = process.env.PORT;
let distDir = __dirname + "/dist/";
app.use(express.static(distDir));
app.listen(port, (err) => {
    if (err) {
        return logger.error(err);
    }
    console.log('Server is running on port', port);
})
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelEmail } = require('../email/account');

const router = new express.Router();
const avatar = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Invalid file'));
        }

        cb(undefined, true);
    }
});

router.post('/users', async (req, res) => {    
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token});
    } catch(error) {
        res.status(400).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({ user, token });
    } catch(error) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);        
        await req.user.save();
        res.status(200).send();
    } catch(error) {
        res.status(500).send();
    }
});

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch(error) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.status(200).send(req.user);
});

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }

//         res.status(200).send(user);
//     } catch(error) {
//         res.status(500).send(error);
//     }
// });

router.patch('/users/me', auth, async (req, res) => {
    //const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = [ "name", "email", "password", "age" ];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Operation' });
    }

    try {        
        // const user = await User.findById(_id);        
        // if (!user) {
        //     return res.status(404).send();
        // }

        updates.forEach((update) =>  req.user[update] = req.body[update]);      
        //console.log(req.user);  
        await req.user.save();        

        res.status(200).send(req.user);
    } catch(error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    //const _id = req.params.id;

    try {
        // const user = await User.findByIdAndDelete(req.user._id);

        // if (!user) {
        //     res.status(404).send();
        // }

        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.status(200).send(req.user);
    } catch(error) {
        res.status(400).send(error);
    }
});

router.post('/users/avatar', auth, avatar.single('avatar'), async (req, res) => {    
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(error) {
        res.status(404).send();
    }
});

module.exports = router;

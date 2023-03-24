const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
});
const promisePool = pool.promise();

module.exports = router;

router.get('/', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT lj04forum.*, lj04users.name FROM lj04forum JOIN lj04users ON lj04forum.authorId = lj04users.id")
    res.render('index.njk', {
        rows: rows,
        title: 'Forum',
        user : req.session.username || 0
    });
});

router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query("SELECT * FROM lj04users");
    res.render('new.njk', {
        title: 'Nytt inlägg',
        user : req.session.username || 0,
        users,
    });
});

router.post('/new', async function (req, res, next) {
    const { author, title, content } = req.body;

    let user = await promisePool.query('SELECT * FROM lj04users WHERE name = ?', [author]);
    if (!user) {
        user = await promisePool.query('INSERT INTO lj04users (name) VALUES (?)', [author]);
    }
    const userId = user.insertId || user[0][0].id;
    const [rows] = await promisePool.query('INSERT INTO lj04forum (authorId, title, content) VALUES (?, ?, ?)', [userId, title, content]);
    res.redirect('/'); 
});

router.get('/post/:id', async function (req, res) {
    const [rows] = await promisePool.query('SELECT * FROM lj04forum WHERE id = ?', [req.params.id])
    res.render('post.njk', {
        post: rows[0],
        title: 'Inlägg',
        user : req.session.username || 0
    });
});

router.get('/login', async function (req, res, next) {
    res.render('login.njk', {
        title: 'Login',
    });
});

router.get('/profile', async function (req, res, next) {

    if (req.session.login == 1) {
        res.render('profile.njk', { 
            title: 'Profile', 
            user : req.session.username || 0,
        });
    }
    
    else {
        return res.status(401).send('Access denied')
    }
});

router.post('/profile', async function (req, res, next) {
    req.body = { logout };


});

router.get('/logout', async function (req, res, next) {

    res.render('logout.njk', { title: 'Logout' });
    req.session.login = 0;
});

router.post('/logout', async function (req, res, next) {

    // if (req.session.login === 1) {
    //     req.session.login = 0;
    //     res.redirect('/')
    // }
    // else {
    //     return res.status(401).send('Access denied')
    // }

});

router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;


    if (username.length == 0) {
        return res.send('Username is Required')
    }
    if (password.length == 0) {
        return res.send('Password is Required')
    }

    const [user] = await promisePool.query('SELECT * FROM lj04users WHERE name = ?', [username]);


    bcrypt.compare(password, user[0].password, function (err, result) {
        //logga in eller nåt

        if (result === true) {
            // return res.send('Welcome')
            req.session.username = username;
            req.session.login = 1;
            return res.redirect('/profile');
        }

        else {
            return res.send("Invalid username or password")
        }

    })


});

router.get('/crypt/:password', async function (req, res, next) {
    const password = req.params.password
    // const [password] = await promisePool.query('SELECT password FROM dbusers WHERE none = ?', [password]);
    bcrypt.hash(password, 10, function (err, hash) {
        return res.json({ hash });

    })
});

router.get('/signin', function (req, res, next) {
    res.render('signin.njk', { title: 'sign' });
});

router.get('/register', function (req, res, next) {
    res.render('register.njk', { title: 'register' });

});

router.post('/register', async function (req, res, next) {
    const { username, password, passwordConfirmation } = req.body;

    if (username === "") {
        console.log({ username })
        return res.send('Username is Required')

    }
    else if (password.length === 0) {
        return res.send('Password is Required')
    }
    else if (passwordConfirmation.length === 0) {
        return res.send('Password is Required')
    }
    else if (password !== passwordConfirmation) {
        return res.send('Passwords do not match')
    }

    const [user] = await promisePool.query('SELECT name FROM lj04users WHERE name = ?', [username]);
    console.log({ user })

    if (user.length > 0) {
        return res.send('Username is already taken')
    } else {
        bcrypt.hash(password, 10, async function (err, hash) {
            const [creatUser] = await promisePool.query('INSERT INTO lj04users (name, password) VALUES (?, ?)', [username, hash]);
            res.redirect('/login')
        })
    }
});

router.get('/delete', async function (req, res, next) {

    res.render('delete.njk', { title: 'Delete' });

});

router.post('/delete', async function (req, res, next) {
    const { username } = req.body;
    if (req.session.login === 1) {
        const [Delet] = await promisePool.query('DELETE FROM dbusers WHERE name = ?', [username]);
        req.session.login = 0
        res.redirect('/')
    }
});

module.exports = router;
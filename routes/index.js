const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
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
    });
});

router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query("SELECT * FROM lj04users");
    res.render('new.njk', {
        title: 'Nytt inlägg',
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

router.get('/login', async function (req, res, next) {
    res.render('login.njk', {
        title: 'Logga in',
    });
});

router.get('/post/:id', async function (req, res) {
    const [rows] = await promisePool.query('SELECT * FROM lj04forum WHERE id = ?', [req.params.id])
    res.render('post.njk', {
        post: rows[0],
        title: 'Inlägg',
    });
});




// Path: views/index.njk
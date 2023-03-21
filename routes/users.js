const express = require('express');
const router = express.Router();
const promisePool = require('../utils/db');

router.get('/', async function (req, res) {
    res.send("Alla users i systemets");
});

router.get('/:id', async function (req, res) {
    const [rows] = await promisePool.query(`
    SELECT * FROM lj04users WHERE id = ?`, [req.params.id]);
    res.json({ id: req.params.id, user: rows[0] });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const auth = require('../middleware/auth');

router.get('/applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'adminSchool') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const apps = await Application.find().populate('user');

        let csv = 'Name,Email,School,Program,Status\n';

        apps.forEach(app => {
            csv += `${app.user.name},${app.user.email},${app.school},${app.program},${app.status}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('applications.csv');
        res.send(csv);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;

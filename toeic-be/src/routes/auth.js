const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const { verifyRole } = require('../middlewares/auth');

// Đăng nhập
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
  });
});

// Lấy danh sách users
router.get('/users', verifyRole('Admin'), (req, res) => {
  db.query('SELECT id, full_name, user_id, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// Thêm hoặc cập nhật quyền
router.post('/assign-role', verifyRole('Admin'), (req, res) => {
  const { id, role } = req.body;
  if (!['Admin', 'User', 'Giảng viên'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  db.query('UPDATE users SET role = ? WHERE id = ?', [role, id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: 'Role assigned successfully' });
  });
});

// Xóa quyền (chuyển về User)
router.delete('/remove-role', verifyRole('Admin'), (req, res) => {
  const { id } = req.body;
  db.query('UPDATE users SET role = ? WHERE id = ?', ['User', id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: 'Role removed successfully' });
  });
});

module.exports = router;
console.log('Bắt đầu chạy index.js...');

try {
    const express = require('express');
    const cors = require('cors');
    const db = require('./db');

    console.log('Đã import các module, đang thiết lập server...');

    const app = express();

    // Middleware
    app.use(cors({ origin: 'http://localhost:5173' }));
    app.use(express.json());

    console.log('Đã thiết lập middleware, đang định nghĩa routes...');

    // Route kiểm tra server
    app.get('/', (req, res) => {
        console.log('Nhận yêu cầu GET /');
        res.json({ message: 'Backend TOEIC đang chạy!' });
    });

    // API cho bảng users
    app.get('/api/users', (req, res) => {
        console.log('Nhận yêu cầu GET /api/users');
        db.query('SELECT id, username, email, full_name, role FROM users', (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn users:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi lấy danh sách người dùng' });
            }
            console.log('Truy vấn users thành công:', results);
            res.json(results);
        });
    });

    app.post('/api/users', (req, res) => {
        console.log('Nhận yêu cầu POST /api/users:', req.body);
        const { username, email, password, full_name, role } = req.body;
        if (!username || !email || !password) {
            console.error('Thiếu thông tin bắt buộc trong POST /api/users');
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: username, email, password' });
        }
        const query = 'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [username, email, password, full_name || null, role || 'user'], (err, result) => {
            if (err) {
                console.error('Lỗi thêm người dùng:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi thêm người dùng' });
            }
            console.log('Thêm người dùng thành công:', { id: result.insertId });
            res.status(201).json({ id: result.insertId, username, email, full_name, role });
        });
    });

    // API cho bảng courses
    app.get('/api/courses', (req, res) => {
        console.log('Nhận yêu cầu GET /api/courses');
        db.query('SELECT id, title, description, instructor_id FROM courses', (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn courses:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi lấy danh sách khóa học' });
            }
            console.log('Truy vấn courses thành công:', results);
            res.json(results);
        });
    });

    app.post('/api/courses', (req, res) => {
        console.log('Nhận yêu cầu POST /api/courses:', req.body);
        const { title, description, instructor_id } = req.body;
        if (!title) {
            console.error('Thiếu thông tin bắt buộc trong POST /api/courses');
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: title' });
        }
        const query = 'INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)';
        db.query(query, [title, description || null, instructor_id || null], (err, result) => {
            if (err) {
                console.error('Lỗi thêm khóa học:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi thêm khóa học' });
            }
            console.log('Thêm khóa học thành công:', { id: result.insertId });
            res.status(201).json({ id: result.insertId, title, description, instructor_id });
        });
    });

    // API cho bảng leaderboard
    app.get('/api/leaderboard', (req, res) => {
        console.log('Nhận yêu cầu GET /api/leaderboard');
        const query = `
            SELECT l.id, l.score, l.rank, l.achieved_at, u.username, u.full_name, c.title AS course_title
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN courses c ON l.course_id = c.id
            ORDER BY l.rank ASC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn leaderboard:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi lấy bảng xếp hạng' });
            }
            console.log('Truy vấn leaderboard thành công:', results);
            res.json(results);
        });
    });

    app.post('/api/leaderboard', (req, res) => {
        console.log('Nhận yêu cầu POST /api/leaderboard:', req.body);
        const { user_id, course_id, score, rank } = req.body;
        if (!user_id || !score) {
            console.error('Thiếu thông tin bắt buộc trong POST /api/leaderboard');
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: user_id, score' });
        }
        const query = 'INSERT INTO leaderboard (user_id, course_id, score, rank) VALUES (?, ?, ?, ?)';
        db.query(query, [user_id, course_id || null, score, rank || null], (err, result) => {
            if (err) {
                console.error('Lỗi thêm điểm leaderboard:', err.message);
                return res.status(500).json({ error: 'Lỗi server khi thêm điểm' });
            }
            console.log('Thêm điểm leaderboard thành công:', { id: result.insertId });
            res.status(201).json({ id: result.insertId, user_id, course_id, score, rank });
        });
    });

    // API bổ sung cho user profile và reset password
    app.get('/api/users/profile', (req, res) => {
        console.log('Nhận yêu cầu GET /api/users/profile');
        res.json({ id: 1, username: 'admin1', email: 'admin1@example.com', role: 'admin' });
    });

    app.post('/api/users/reset-password', (req, res) => {
        console.log('Nhận yêu cầu POST /api/users/reset-password:', req.body);
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu mới' });
        }
        const query = 'UPDATE users SET password = ? WHERE email = ?';
        db.query(query, [newPassword, email], (err, result) => {
            if (err) {
                console.error('Lỗi reset mật khẩu:', err.message);
                return res.status(500).json({ error: 'Lỗi server' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
            res.json({ message: 'Reset mật khẩu thành công' });
        });
    });

    console.log('Đã thiết lập các routes, đang khởi động server...');

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server chạy trên cổng ${PORT}`);
    });

    console.log('Đã gọi app.listen, đang chờ server khởi động...');
} catch (error) {
    console.error('Lỗi khi chạy index.js:', error.message);
}
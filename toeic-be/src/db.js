console.log('Bắt đầu khởi tạo db.js...');

const mysql = require('mysql2');

console.log('Đã import mysql2, đang thiết lập kết nối MySQL...');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'toeic_db'
});

connection.on('error', (err) => {
    console.error('Lỗi kết nối MySQL:', err.message);
});

connection.connect((err) => {
    if (err) {
        console.error('Lỗi khi kết nối MySQL:', err.message);
        return;
    }
    console.log('Kết nối MySQL thành công');
});

console.log('Đã thiết lập kết nối MySQL, xuất module...');

module.exports = connection;
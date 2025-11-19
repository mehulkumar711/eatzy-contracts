const bcrypt = require('bcryptjs');

async function hashPassword() {
    const hash = await bcrypt.hash('admin123', 12);
    console.log('New Hash:', hash);
}

hashPassword();

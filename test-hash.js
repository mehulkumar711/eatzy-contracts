const bcrypt = require('bcryptjs');

async function testHash() {
    const password = 'admin123';

    // Generate a new hash
    const newHash = await bcrypt.hash(password, 12);
    console.log('Generated Hash:');
    console.log(newHash);
    console.log('\nHash Length:', newHash.length);

    // Test if it works
    const isValid = await bcrypt.compare(password, newHash);
    console.log('\nTest Result:', isValid ? '✅ VALID' : '❌ INVALID');

    // Also test the old hash from seed
    const oldHash = '$2b$12$NxDGfTVvoSs7dl1RVYVXH.e9lJVb0NFnkpwIZP.yY8314zlAd2AkG';
    const oldValid = await bcrypt.compare(password, oldHash);
    console.log('Old Hash Test:', oldValid ? '✅ VALID' : '❌ INVALID');
}

testHash();

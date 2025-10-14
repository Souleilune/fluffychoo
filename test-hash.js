const bcrypt = require('bcryptjs');

async function test() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nRun this SQL in Supabase:');
  console.log(`UPDATE admins SET password_hash = '${hash}' WHERE email = 'admin@fluffychoo.com';`);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('\nHash validation test:', isValid ? '✅ PASS' : '❌ FAIL');
}

test();
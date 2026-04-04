const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found");
    return;
  }
  
  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production', { expiresIn: '15m' });
  
  console.log("Got token for user:", user.email);
  try {
    const response = await fetch('http://localhost:3000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    console.log("---API RESPONSE---");
    console.log(JSON.stringify(data));
    console.log("---API END---");
  } catch (err) {
    console.error(err.message);
  }
}
main().finally(() => process.exit(0));

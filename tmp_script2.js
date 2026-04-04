import axios from 'axios';

async function test() {
  try {
    // We'll create a user or login if possible. But better yet, I'll use Prisma to generate a token.
    console.log('Testing...');
  } catch (err) {
    console.error(err);
  }
}

test();

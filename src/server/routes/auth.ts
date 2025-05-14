import rateLimit from 'express-rate-limit';
import express, { Request } from 'express';
import { Users } from '../db';

const router = express.Router();

router.get('/register', (_request, response) => {
  // @ts-expect-error
  const error = _request.session.error;
  // @ts-expect-error
  delete _request.session.error;
  response.render('register', {
    title: 'Auth: Register',
    error: error || null,
  });
});

type RegisterRequest = Request<{
  username: string;
  email: string;
  password: string;
}>;

type LoginRequest = Request<{
  email: string;
  password: string;
}>;

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many accounts created from this IP',
});

router.post('/register', createAccountLimiter, async (request: RegisterRequest, response) => {
  const { username, email, password } = request.body;

  try {
    // @ts-expect-error
    request.session.user = await Users.create({ username, email, password });

    request.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return response.redirect('/auth/register');
      }
      response.redirect('/lobby');
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    let message = 'Registration failed';

    if (error.code === '23505') {
      // duplicate key
      if (error.detail?.includes('username')) {
        message = 'Username already exists';
      } else if (error.detail?.includes('email')) {
        message = 'Email already registered';
      } else {
        message = 'Account already exists';
      }
    }

    // @ts-expect-error
    request.session.error = message;
    request.session.save(() => {
      response.redirect('/auth/register');
    });
  }
});

router.get('/login', (_request, response) => {
  // @ts-expect-error
  const error = _request.session.error;
  // @ts-expect-error
  delete _request.session.error;
  response.render('login', {
    title: 'Auth: Login',
    error: error || null,
  });
});

router.post('/login', async (request: LoginRequest, response) => {
  const { email, password } = request.body;

  try {
    // @ts-expect-error TODO fix this error for session
    request.session.user = await Users.login({ email, password });

    request.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return response.redirect('/auth/login');
      }
      response.redirect('/lobby');
    });
  } catch (error) {
    console.error(error);
    // @ts-expect-error
    request.session.error = 'Invalid email or password';
    request.session.save(() => {
      response.redirect('/auth/login');
    });
  }
});

router.get('/logout', async (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      console.error('Error destroying session:', error);
      return response.redirect('/');
    }

    response.clearCookie('connect.sid');
    response.redirect('/auth/login');
  });
});

export default router;

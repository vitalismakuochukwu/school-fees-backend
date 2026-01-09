require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); // Required for bridging sessions to tokens

// Route Imports
const authRoutes = require('./routes/authRoutes');
const feeRoutes = require('./routes/feeRoutes');
const Student = require('./models/Student');
const healthRoutes = require('./routes/healthRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Add this line


const app = express();
const PORT = process.env.PORT || 5000;

// 1. TRUST PROXY (Critical for Render/HTTPS)
app.set('trust proxy', 1); 

// 2. MIDDLEWARE
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   credentials: true 
// }));
// app.use(cors({
//   origin: true, // This allows your frontend to connect regardless of the URL
//   credentials: true 
// }));
// This allows your frontend to talk to your backend
app.use(cors({
  origin: true, // This allows your frontend URL to connect
  credentials: true, // This allows the "session check" to work
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SESSION CONFIGURATION
app.use(session({
  secret: process.env.SESSION_SECRET || 'futo-portal-2026-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// 4. PASSPORT INITIALIZATION
app.use(passport.initialize());
app.use(passport.session());

// 5. GOOGLE STRATEGY
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // 1. Search for a student with this email FIRST
      let student = await Student.findOne({ email: email });

      if (student) {
        // 2. If they exist, just add their googleId so they can use Google next time too
        if (!student.googleId) {
          student.googleId = profile.id;
          await student.save();
        }
      } else {
        // 3. Only if the email DOES NOT exist, create a new student
        student = await Student.create({
          email: email,
          fullName: profile.displayName,
          googleId: profile.id,
          regNo: "NOT_SET_" + Date.now(), // This will only happen for brand new users
          isActivated: true
        });
      }

      return done(null, student);
    } catch (err) {
      console.error("Google Strategy Error:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 6. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected & Session Store Active'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// 7. AUTH ROUTES
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'https://school-fees-frontend-iota.vercel.app/login' }),
  (req, res) => {
    res.redirect('https://school-fees-frontend-iota.vercel.app/dashboard'); 
});

// // UPDATED ME ROUTE: Now generates a JWT token for the session user
// app.get('/api/auth/me', (req, res) => {
//   if (req.isAuthenticated && req.isAuthenticated()) {
//     // Generate a JWT token so Google users can call protected /api routes
//     const token = jwt.sign(
//       { id: req.user._id }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '1d' }
//     );

//     // Return the user data PLUS the token
//     res.json({
//       ...req.user.toObject(),
//       token: token
//     });
//   } else {
//     res.status(401).json({ message: "Not authenticated" });
//   }
// });
// UPDATED ME ROUTE: Now with a 'try-catch' safety net
app.get('/api/auth/me', (req, res) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
      // 1. Check if the secret exists
      if (!process.env.JWT_SECRET) {
        console.error("FATAL: JWT_SECRET is missing from Environment Variables");
        return res.status(500).json({ message: "Server configuration error (JWT)" });
      }

      // 2. Try to generate the token
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      // 3. Send successful response
      res.json({
        ...req.user.toObject(),
        token: token
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  } catch (error) {
    // This logs the REAL error to your Render dashboard logs
    console.error("CRASH in /api/auth/me:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy();
    res.redirect('https://school-fees-frontend-iota.vercel.app/');
  });
});

// Section 8 (Update this part)

app.use('/api', authRoutes); 
app.use('/api/fees', feeRoutes);
app.use('/api/admin', adminRoutes); // Add this line to fix the 404!
// 9. START SERVER

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
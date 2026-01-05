// require('dotenv').config(); // This MUST be line 1
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const authRoutes = require('./routes/authRoutes');
// const Student = require('./models/Student');
// require('dotenv').config();


// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database Connection
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your_session_secret',
//   resave: false,
//   saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Check if user already exists
//       let student = await Student.findOne({ googleId: profile.id });

//       if (student) {
//         return done(null, student);
//       }

//       // Check if user exists by email to link account
//       student = await Student.findOne({ email: profile.emails[0].value });
//       if (student) {
//         student.googleId = profile.id;
//         await student.save();
//         return done(null, student);
//       }

//       // If not, create a new user
//       student = await Student.create({
//         googleId: profile.id,
//         fullName: profile.displayName,
//         email: profile.emails[0].value,
//         isActivated: true
//       });
//       return done(null, student);
//     } catch (err) {
//       console.error(err);
//       return done(err, null);
//     }
//   }
// ));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await Student.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// // Database Connection
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_fees_portal';

// mongoose.connect(MONGO_URI, {
//   serverSelectionTimeoutMS: 5000 // Fail faster (5s) if DB is unreachable
// })
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => {
//     console.error('MongoDB Connection Error:', err);
//     process.exit(1); // Stop the server if DB connection fails
//   });

// // Routes
// app.use('/api/auth', authRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Google OAuth routes
// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     // Successful authentication, redirect to dashboard.
//     res.redirect('/dashboard');
// });

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });


require('dotenv').config(); // Loaded ONCE at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const Student = require('./models/Student');
const feeRoutes = require('./routes/feeRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Debugging check (Remove this after it works)
console.log("Environment Check - Client ID exists:", !!process.env.GOOGLE_CLIENT_ID);

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  // Use a secret from .env or a strong fallback string
  secret: process.env.SESSION_SECRET || 'hostel-portal-security-string-2026', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true only if using HTTPS (production)
    httpOnly: true, // This makes it much harder for attackers to steal cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 4. Passport Initialization
app.use(passport.initialize());
app.use(passport.session());


// 5. Google Strategy Setup
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   callbackURL: "http://localhost:5000/auth/google/callback"
  },
  // ... rest of the code
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Step A: Check if user already has a Google ID linked
      let student = await Student.findOne({ googleId: profile.id });

      if (student) {
        return done(null, student);
      }

      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

      if (!email) {
        return done(new Error("No email found from Google"), null);
      }

      // Step B: Check if email exists (User signed up manually before)
      student = await Student.findOne({ email: email });
      if (student) {
        student.googleId = profile.id; // Link the account
        await student.save();
        return done(null, student);
      }

      // Step C: Create a new Student if they don't exist at all
      student = await Student.create({
        googleId: profile.id,
        fullName: profile.displayName,
        email: email,
        isActivated: true // Google accounts are pre-verified
      });
      return done(null, student);
    } catch (err) {
      console.error("OAuth Strategy Error:", err);
      return done(err, null);
    }
  }
));

// 6. Passport Serialization
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

// 7. Database Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// 8. Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', authRoutes);
app.use('/api', feeRoutes);

// 9. Google OAuth Specific Endpoints
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // CHANGE THIS: Redirect to your React Port (3000) instead of Backend Port (5000)
    res.redirect('http://localhost:3000/dashboard'); 
});
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// 10. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
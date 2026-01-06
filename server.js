
// // require('dotenv').config(); // Loaded ONCE at the very top
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const session = require('express-session');
// // const passport = require('passport');
// // const GoogleStrategy = require('passport-google-oauth20').Strategy;
// // const authRoutes = require('./routes/authRoutes');
// // const studentRoutes = require('./routes/studentRoutes');
// // const Student = require('./models/Student');
// // const feeRoutes = require('./routes/feeRoutes');
// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // 1. Debugging check (Remove this after it works)
// // console.log("Environment Check - Client ID exists:", !!process.env.GOOGLE_CLIENT_ID);

// // // 2. Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // app.use(session({
// //   // Use a secret from .env or a strong fallback string
// //   secret: process.env.SESSION_SECRET || 'hostel-portal-security-string-2026', 
// //   resave: false,
// //   saveUninitialized: false,
// //   cookie: { 
// //     secure: false, // Set to true only if using HTTPS (production)
// //     httpOnly: true, // This makes it much harder for attackers to steal cookies
// //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
// //   }
// // }));

// // // 4. Passport Initialization
// // app.use(passport.initialize());
// // app.use(passport.session());


// // // 5. Google Strategy Setup
// //   passport.use(new GoogleStrategy({
// //     clientID: process.env.GOOGLE_CLIENT_ID,
// //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// //    callbackURL: "http://localhost:5000/auth/google/callback"
// //   },
// //   // ... rest of the code
// //   async (accessToken, refreshToken, profile, done) => {
// //     try {
// //       // Step A: Check if user already has a Google ID linked
// //       let student = await Student.findOne({ googleId: profile.id });

// //       if (student) {
// //         return done(null, student);
// //       }

// //       const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

// //       if (!email) {
// //         return done(new Error("No email found from Google"), null);
// //       }

// //       // Step B: Check if email exists (User signed up manually before)
// //       student = await Student.findOne({ email: email });
// //       if (student) {
// //         student.googleId = profile.id; // Link the account
// //         await student.save();
// //         return done(null, student);
// //       }

// //       // Step C: Create a new Student if they don't exist at all
// //       student = await Student.create({
// //         googleId: profile.id,
// //         fullName: profile.displayName,
// //         email: email,
// //         isActivated: true // Google accounts are pre-verified
// //       });
// //       return done(null, student);
// //     } catch (err) {
// //       console.error("OAuth Strategy Error:", err);
// //       return done(err, null);
// //     }
// //   }
// // ));

// // // 6. Passport Serialization
// // passport.serializeUser((user, done) => {
// //   done(null, user.id);
// // });

// // passport.deserializeUser(async (id, done) => {
// //   try {
// //     const user = await Student.findById(id);
// //     done(null, user);
// //   } catch (err) {
// //     done(err, null);
// //   }
// // });

// // // 7. Database Connection
// // const MONGO_URI = process.env.MONGO_URI;

// // mongoose.connect(MONGO_URI)
// //   .then(() => console.log('✅ MongoDB Connected'))
// //   .catch(err => {
// //     console.error('❌ MongoDB Connection Error:', err);
// //     process.exit(1);
// //   });

// // // 8. Authentication Routes
// // app.use('/api/auth', authRoutes);
// // app.use('/api/student', studentRoutes);
// // app.use('/api', authRoutes);
// // app.use('/api', feeRoutes);

// // // 9. Google OAuth Specific Endpoints
// // app.get('/auth/google',
// //   passport.authenticate('google', { scope: ['profile', 'email'] })
// // );

// // app.get('/auth/google/callback', 
// //   passport.authenticate('google', { failureRedirect: '/login' }),
// //   (req, res) => {
// //     // CHANGE THIS: Redirect to your React Port (3000) instead of Backend Port (5000)
// //     res.redirect('http://localhost:3000/dashboard'); 
// // });
// // app.get('/logout', (req, res) => {
// //   req.logout((err) => {
// //     if (err) return next(err);
// //     res.redirect('/');
// //   });
// // });

// // // 10. Start Server
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// require('dotenv').config(); 
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const session = require('express-session');
// const MongoStore = require('connect-mongo'); // Try this first

// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// const authRoutes = require('./routes/authRoutes');
// const feeRoutes = require('./routes/feeRoutes');
// const Student = require('./models/Student');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Debugging check
// console.log("Environment Check - Client ID exists:", !!process.env.GOOGLE_CLIENT_ID);

// // 2. Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // This version handles the modern export structure
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'hostel-portal-security-string-2026',
//   resave: false,
//   saveUninitialized: false,
//   store: (MongoStore.create ? MongoStore.create({
//     mongoUrl: process.env.MONGO_URI,
//     collectionName: 'sessions'
//   }) : MongoStore.default.create({
//     mongoUrl: process.env.MONGO_URI,
//     collectionName: 'sessions'
//   })),
//   cookie: { 
//     secure: false, 
//     httpOnly: true, 
//     maxAge: 24 * 60 * 60 * 1000 
//   }
// }));

// // 4. Passport Initialization (MUST come after session)
// app.use(passport.initialize());
// app.use(passport.session());

// // 5. Google Strategy Setup
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://school-fees-backend.onrender.com/auth/google/callback"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let student = await Student.findOne({ googleId: profile.id });
//       if (student) return done(null, student);

//       const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
//       if (!email) return done(new Error("No email found from Google"), null);

//       student = await Student.findOne({ email: email });
//       if (student) {
//         student.googleId = profile.id; 
//         await student.save();
//         return done(null, student);
//       }

//       student = await Student.create({
//         googleId: profile.id,
//         fullName: profile.displayName,
//         email: email,
//         isActivated: true 
//       });
//       return done(null, student);
//     } catch (err) {
//       console.error("OAuth Strategy Error:", err);
//       return done(err, null);
//     }
//   }
// ));

// // 6. Passport Serialization
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

// // 7. Database Connection
// const MONGO_URI = process.env.MONGO_URI;
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected & Session Store Active'))
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err);
//     process.exit(1);
//   });

// // 8. Routes
// app.use('/api', authRoutes);
// app.use('/api', feeRoutes);

// // 9. Google OAuth Specific Endpoints
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     res.redirect('http://localhost:3000/dashboard'); 
// });

// app.get('/logout', (req, res, next) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     res.redirect('/');
//   });
// });

// // 10. Start Server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Route Imports
const authRoutes = require('./routes/authRoutes');
const feeRoutes = require('./routes/feeRoutes');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. TRUST PROXY (Critical for Render/HTTPS)
app.set('trust proxy', 1); 

// 2. MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000', // Allow your local React frontend
  credentials: true // Crucial for sessions/cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SESSION CONFIGURATION
// Ensure this is at the top
const MongoStore = require('connect-mongo');

// Update your session block to this simpler, more modern version
app.use(session({
  secret: process.env.SESSION_SECRET || 'futo-portal-2026-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    // Removed old options that cause issues in Mongoose 9+
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
      
      // Upsert: Find student by email and update or create
      let student = await Student.findOneAndUpdate(
        { email: email },
        { 
          $set: { 
            googleId: profile.id, 
            fullName: profile.displayName,
            isActivated: true 
          } 
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

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
// Google OAuth Entry
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successfully authenticated, redirect to your local frontend
    res.redirect('http://localhost:3000/dashboard'); 
});

// Logout Route
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy();
    res.redirect('http://localhost:3000/');
  });
});

// 8. OTHER API ROUTES
app.use('/api', authRoutes);
app.use('/api', feeRoutes);

// 9. START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
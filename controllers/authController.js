// const Student = require('../models/Student');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

// // 1. Setup the transporter
// const transporter = nodemailer.createTransport({
//   pool: true,                // Keeps connection open
//   host: "smtp.gmail.com",
//   port: 587,                 // Port 587 is the standard for Render
//   secure: false,             // Must be false for 587
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   tls: {
//     rejectUnauthorized: false // Bypasses the handshake timeout
//   }
// });
// // 2. The function to send the code
// async function sendVerificationEmail(userEmail, verificationCode) {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: userEmail, // This sends it to your registered email
//     subject: 'Your Verification Code',
//     text: `Your code is: ${verificationCode}`,
//     html: `<b>Your code is: ${verificationCode}</b>`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent successfully to: " + userEmail);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//   }
// }

// async function sendResetPasswordEmail(userEmail, resetToken) {
//   const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // Adjust URL for production if needed

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: userEmail,
//     subject: 'Password Reset Request - FUTO PAY',
//     html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
//               <h2>Reset Your Password</h2>
//               <p>Click the following link to reset your password:</p>
//               <a href="${resetLink}" style="background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
//               <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
//            </div>`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Reset password email sent successfully to: " + userEmail);
//   } catch (error) {
//     console.error("❌ Error sending reset password email:", error);
//   }
// }

// // Register Controller
// const register = async (req, res) => {
//   try {
//     const { fullName, regNo, department, faculty, email, password } = req.body;

//     // 1. Validate input fields
//     if (!fullName || !regNo || !department || !faculty || !email || !password) {
//       return res.status(400).json({ message: 'Please fill in all fields, including Faculty.' });
//     }

//     // 1. Check if student already exists (by email or regNo)
//     const existingStudent = await Student.findOne({ 
//       $or: [{ email }, { regNo }] 
//     });

//     if (existingStudent) {
//       return res.status(400).json({ message: 'Student with this Email or Reg No already exists.' });
//     }

//     // 2. Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Generate 12 digit activation code
//     const activationCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

//     // 3. Create new student
//     const newStudent = new Student({
//       fullName,
//       regNo,
//       department,
//       faculty,
//       email,
//       password: hashedPassword,
//       activationCode,
//       isActivated: false
//     });

//     // 4. Save to DB
//     await newStudent.save();

//     console.log(`ACTIVATION CODE for ${email}: ${activationCode}`);
//     await sendVerificationEmail(email, activationCode);

//     res.status(201).json({ message: 'Registration successful! Please verify your email.', email });

//   } catch (error) {
//     console.error('Registration Error:', error);
//     res.status(500).json({ message: 'Server error during registration.' });
//   }
// };

// // Verify Email Controller
// const verifyEmail = async (req, res) => {
//   try {
//     const { email, code } = req.body;
//     const student = await Student.findOne({ email });

//     if (!student) return res.status(400).json({ message: 'User not found' });
//     if (student.isActivated) return res.status(400).json({ message: 'User already activated' });
//     if (student.activationCode !== code) return res.status(400).json({ message: 'Invalid activation code' });

//     student.isActivated = true;
//     student.activationCode = undefined; // Clear code after use
//     await student.save();

//     res.status(200).json({ message: 'Account activated successfully. Please login.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error during verification' });
//   }
// };

// // Login Controller
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Find the student by email
//     const student = await Student.findOne({ email });
//     if (!student) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check if account is activated
//     if (!student.isActivated) {
//       return res.status(400).json({ message: 'Please activate your account first.' });
//     }

//     // 2. Check password
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // 3. Generate JWT token
//     const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

//     res.json({ token, message: 'Login successful', user: { fullName: student.fullName, regNo: student.regNo } });

//   } catch (error) {
//     console.error('Login Error:', error);
//     res.status(500).json({ message: 'Server error during login.' });
//   }
// };
// // Resend Verification Code Controller
// const resendVerificationCode = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const student = await Student.findOne({ email });

//     if (!student) return res.status(400).json({ message: 'User not found' });
//     if (student.isActivated) return res.status(400).json({ message: 'User already activated' });

//     const activationCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
//     student.activationCode = activationCode;
//     await student.save();

//     await sendVerificationEmail(email, activationCode);
//     res.status(200).json({ message: 'Verification code resent successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error during resend.' });
//   }
// };

// // Forgot Password Controller
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Find the student by email
//     const student = await Student.findOne({ email });
//     if (!student) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate a reset token with crypto
//     const resetToken = crypto.randomBytes(20).toString('hex');
//     student.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     student.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // Token expires in 1 hour

//     await student.save();

//     // Send reset password email
//     await sendResetPasswordEmail(email, resetToken);

//     res.status(200).json({ message: 'Password reset email sent successfully' });

//   } catch (error) {
//     console.error('Forgot Password Error:', error);
//     res.status(500).json({ message: 'Server error during forgot password request.' });
//   }
// };

// // Get Profile Controller
// const getProfile = async (req, res) => {
//   try {
//     // req.user.id comes from the auth middleware (ensure you have middleware set up in your routes)
//     const student = await Student.findById(req.user.id).select('-password');
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
//     res.json(student);
//   } catch (error) {
//     console.error('Get Profile Error:', error);
//     res.status(500).json({ message: 'Server error fetching profile' });
//   }
// };


// // Update Profile Controller
// const updateProfile = async (req, res) => {
//   try {
//     const { fullName, regNo, department, faculty } = req.body;
    
//     // Find student by ID (from token)
//     const student = await Student.findById(req.user.id);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Update fields if provided
//     if (fullName) student.fullName = fullName;
//     if (regNo) student.regNo = regNo;
//     if (department) student.department = department;
//     if (faculty) student.faculty = faculty;

//     await student.save();
    
//     res.json({ message: 'Profile updated successfully', student });
//   } catch (error) {
//     console.error('Update Profile Error:', error);
//     res.status(500).json({ message: 'Server error updating profile' });
//   }
// };

// module.exports = { register, login, verifyEmail, resendVerificationCode, forgotPassword, getProfile, updateProfile };
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 1. Setup the transporter (Fixed for Render/Gmail Port 465)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 2. Send Verification Email
async function sendVerificationEmail(userEmail, verificationCode) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your 12-Digit Activation Code',
    html: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #ca8a04; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ca8a04;">FUTO School Fees Portal</h2>
        <p>Use the 12-digit code below to activate your account:</p>
        <h1 style="background: #fefce8; padding: 10px; text-align: center; letter-spacing: 4px; color: #1f2937;">
          ${verificationCode}
        </h1>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to: " + userEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

async function sendResetPasswordEmail(userEmail, resetToken) {
  const resetLink = `https://school-fees-backend.onrender.com/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Request - FUTO PAY',
    html: `<h2>Reset Your Password</h2>
           <p>Click the link to reset:</p>
           <a href="${resetLink}" style="padding: 10px 20px; background: #d97706; color: white; text-decoration: none;">Reset Password</a>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent to: " + userEmail);
  } catch (error) {
    console.error("❌ Error sending reset email:", error);
  }
}

// Register Controller
const register = async (req, res) => {
  try {
    const { fullName, regNo, department, faculty, email, password } = req.body;

    if (!fullName || !regNo || !department || !faculty || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const existingStudent = await Student.findOne({ $or: [{ email }, { regNo }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 12 digit activation code
    const activationCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    const newStudent = new Student({
      fullName, regNo, department, faculty, email,
      password: hashedPassword,
      activationCode,
      isActivated: false
    });

    await newStudent.save();

    console.log(`ACTIVATION CODE for ${email}: ${activationCode}`);
    
    // Call the new Resend function
    await sendVerificationEmail(email, activationCode);

    res.status(201).json({ message: 'Registration successful! Check your email.', email });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Verify Email Controller
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const student = await Student.findOne({ email });

    if (!student) return res.status(400).json({ message: 'User not found' });
    if (student.isActivated) return res.status(400).json({ message: 'User already activated' });
    if (student.activationCode !== code) return res.status(400).json({ message: 'Invalid activation code' });

    student.isActivated = true;
    student.activationCode = undefined; 
    await student.save();

    res.status(200).json({ message: 'Account activated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });

    if (!student.isActivated) {
      return res.status(400).json({ message: 'Please activate your account first.' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.json({ token, user: { fullName: student.fullName, regNo: student.regNo } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Resend Verification Code Controller
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });

    if (!student) return res.status(400).json({ message: 'User not found' });
    if (student.isActivated) return res.status(400).json({ message: 'User already activated' });

    const activationCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    student.activationCode = activationCode;
    await student.save();

    await sendVerificationEmail(email, activationCode);
    res.status(200).json({ message: 'Verification code resent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during resend.' });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    student.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    student.resetPasswordExpire = Date.now() + 60 * 60 * 1000; 

    await student.save();
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Profile Controller
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update Profile Controller
const updateProfile = async (req, res) => {
  try {
    const { fullName, regNo, department, faculty } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (fullName) student.fullName = fullName;
    if (regNo) student.regNo = regNo;
    if (department) student.department = department;
    if (faculty) student.faculty = faculty;

    await student.save();
    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { register, login, verifyEmail, resendVerificationCode, forgotPassword, getProfile, updateProfile };
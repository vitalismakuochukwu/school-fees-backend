const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 1. Setup the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 2. The function to send the code
async function sendVerificationEmail(userEmail, verificationCode) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail, // This sends it to your registered email
    subject: 'Your Verification Code',
    text: `Your code is: ${verificationCode}`,
    html: `<b>Your code is: ${verificationCode}</b>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to: " + userEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

// Register Controller
const register = async (req, res) => {
  try {
    const { fullName, regNo, department, faculty, email, password } = req.body;

    // 1. Check if student already exists (by email or regNo)
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { regNo }] 
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this Email or Reg No already exists.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 12 digit activation code
    const activationCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    // 3. Create new student
    const newStudent = new Student({
      fullName,
      regNo,
      department,
      faculty,
      email,
      password: hashedPassword,
      activationCode,
      isActivated: false
    });

    // 4. Save to DB
    await newStudent.save();

    console.log(`ACTIVATION CODE for ${email}: ${activationCode}`);
    await sendVerificationEmail(email, activationCode);

    res.status(201).json({ message: 'Registration successful! Please verify your email.', email });

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
    student.activationCode = undefined; // Clear code after use
    await student.save();

    res.status(200).json({ message: 'Account activated successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is activated
    if (!student.isActivated) {
      return res.status(400).json({ message: 'Please activate your account first.' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

    res.json({ token, message: 'Login successful', user: { fullName: student.fullName, regNo: student.regNo } });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get Profile Controller
const getProfile = async (req, res) => {
  try {
    // req.user.id comes from the auth middleware (ensure you have middleware set up in your routes)
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
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
    
    // Find student by ID (from token)
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields if provided
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

module.exports = { register, login, verifyEmail, getProfile, updateProfile };
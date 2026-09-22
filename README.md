🎓 EduTrack

«A modern Student Management System built with the MERN Stack.»

EduTrack helps tutors efficiently manage students, subjects, papers, marks, and academic progress while providing students with easy access to their academic information.

✨ Features

👨‍🏫 Tutor Portal

- 📝 Self sign-up with a free-choice username and password (no email required)
- ⏳ Login is unlocked only after an administrator approves the request
- 👨‍🎓 Register and manage students
- 📚 Manage subjects and paper categories
- 📝 Add and manage student marks
- 📱 Send login details via SMS
- 📤 Send paper and mark details via SMS
- 📊 Monitor student academic progress
- ⬆️ Promote students

🛡️ Admin Portal

- 🔐 Sign in with Firebase (admin email only) at `/admin/login`
- ✅ Approve or reject tutor requests
- 🔑 Reset a tutor's password when they forget their credentials

👨‍🎓 Student Portal

- 🔐 Secure authentication
- 📚 View papers and subjects
- 📊 View marks and results
- 📈 Track academic progress
- 👤 View profile

📱 Responsive Design

- 📱 Mobile-friendly
- 💻 Desktop optimized
- 📐 Tablet responsive

🛠️ Tech Stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=react" width="45" alt="React.js"/>
  <img src="https://skillicons.dev/icons?i=js" width="45" alt="JavaScript"/>
  <img src="https://skillicons.dev/icons?i=html" width="45" alt="HTML5"/>
  <img src="https://skillicons.dev/icons?i=css" width="45" alt="CSS3"/>
  <img src="https://skillicons.dev/icons?i=nodejs" width="45" alt="Node.js"/>
  <img src="https://skillicons.dev/icons?i=express" width="45" alt="Express.js"/>
  <img src="https://skillicons.dev/icons?i=mongodb" width="45" alt="MongoDB"/>
  <img src="https://skillicons.dev/icons?i=firebase" width="45" alt="Firebase"/>
</p>React.js • JavaScript • HTML5 • CSS3 • Node.js • Express.js • MongoDB • Firebase

🔑 Authentication Model

- **Tutors** authenticate with a username + password stored in MongoDB (`server/routes/tutorAuthRoutes.js`). Passwords are hashed with `scrypt`; sessions are signed HMAC tokens. New sign-ups start as `pending` and cannot log in until an admin approves them.
- **Administrators** authenticate through **Firebase Authentication** (email + password). Only the configured admin email/UID may use the admin panel (`server/middleware/auth.js`). The admin panel lives in its own folder: `client/src/admin/`.


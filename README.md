# e-Storage 📦✨

**e-Storage** is a secure file storage platform that allows users to register, authenticate, and upload their files in a protected and reliable environment, similar to Google Drive. The core functionality is powered by Firebase Storage and Multer, ensuring fast and secure file uploads.

---

## 🌐 Tech Stack

- **Frontend Rendering:** EJS (Embedded JavaScript Templates)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **File Uploads:** Multer
- **File Storage:** Firebase Storage
- **Password Security:** bcryptjs, crypto (HMAC)

---

## 🔐 Features

### 1. **User Authentication & Authorization**
- Signup and Login system with JWT token generation.
- Middleware to protect routes (`identifier`) by verifying tokens from headers or cookies.
- Token is securely passed via `Authorization` header (Bearer format) or cookies.
- Passwords are hashed before storage and excluded from returned user objects.

### 2. **Secure File Upload System**
- Files are uploaded via **Multer** and streamed directly to **Firebase Storage**.
- Only authenticated users are allowed to upload files.
- Each file is stored securely and can be retrieved via Firebase URLs.
- Mimics a private storage system like Google Drive.

### 3. **Form Validation**
- Validates input data for all auth-related routes using **Joi** schemas:
  - `signupSchema`
  - `signinSchema`
  - `acceptCodeSchema`
  - `changePasswordSchema`
  - `acceptForgotPasswordCodeSchema`

### 4. **Hashing & Security Utilities**
- Passwords and sensitive values are hashed securely using `bcryptjs`, which adds a layer of protection by storing only the hashed versions.
- For verifying user-provided passwords, hashed values are compared to ensure validity without exposing the actual password.
- Additionally, HMAC (Hash-based Message Authentication Code) with SHA-256 is used for cryptographic purposes, ensuring data integrity and authentication.

---


## 🚀 How It Works

1. User registers with email and password.
2. Authenticated sessions are managed with JWT and checked for each upload request.
3. Files are uploaded using Multer and pushed to Firebase Storage.
4. Users can securely store and retrieve files as needed.

---

## 🔗 Demo
[Visit Live Demo](https://e-storage.onrender.com/)

## 📬 Contact

Made with 💻 by **Premanshu Kashyap**


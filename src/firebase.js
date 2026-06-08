import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDd0J5fWtDAnWeuymVAl8ak7xKgR8uvZcA",
  authDomain: "buildtogether-a0ba1.firebaseapp.com",
  projectId: "buildtogether-a0ba1",
  storageBucket: "buildtogether-a0ba1.firebasestorage.app",
  messagingSenderId: "224041161193",
  appId: "1:224041161193:web:9bfa15b9abe6cb4cf07b78",
  measurementId: "G-VJJNKWXEYP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (optional)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

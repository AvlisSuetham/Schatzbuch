import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuqLzV5xgFDONE7nS9kzq1xklGbGd-Y74",
  authDomain: "schatzbuch-f1207.firebaseapp.com",
  projectId: "schatzbuch-f1207",
  storageBucket: "schatzbuch-f1207.firebasestorage.app",
  messagingSenderId: "576424749061",
  appId: "1:576424749061:web:bccf9227c404dd5d89546c",
  measurementId: "G-QD79B2VTLV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

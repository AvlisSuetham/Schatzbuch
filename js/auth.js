import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Login realizado com sucesso!");
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Erro ao fazer login:", error.message);
            alert("Erro ao fazer login: " + error.message);
        });
});

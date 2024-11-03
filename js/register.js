import { auth } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore();

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salvar o nome de usuário no Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email
        });

        alert("Cadastro realizado com sucesso!");
        window.location.href = "dashboard.html"; // Redirecionar para a dashboard após o registro
    } catch (error) {
        console.error("Erro ao cadastrar:", error.message);
        alert("Erro ao cadastrar: " + error.message);
    }
});

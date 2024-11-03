import { auth } from "./firebaseConfig.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore();

const usernameDisplay = document.getElementById("username-display");

// Verificar se o usuário está autenticado
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Obter o nome de usuário do Firestore
        const uid = user.uid;
        const userDoc = doc(db, "users", uid); // "users" é a coleção onde você armazena os dados do usuário
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            usernameDisplay.textContent = data.username || "Usuário";
        } else {
            console.log("Nenhum documento encontrado!");
        }
    } else {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = "login.html";
    }
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error.message);
    });
});

// Funções para as opções do menu
document.getElementById("available-books").addEventListener("click", () => {
    document.getElementById("content").innerHTML = "<h2>Livros Disponíveis</h2><p>Aqui você verá os livros disponíveis para locação.</p>";
});

document.getElementById("rented-books").addEventListener("click", () => {
    document.getElementById("content").innerHTML = "<h2>Livros Locados</h2><p>Aqui você verá os livros que você locou.</p>";
});

document.getElementById("overdue-books").addEventListener("click", () => {
    document.getElementById("content").innerHTML = "<h2>Livros em Atraso</h2><p>Aqui você verá os livros que estão em atraso.</p>";
});

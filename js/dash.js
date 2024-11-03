import { auth } from "./firebaseConfig.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore();
const usernameDisplay = document.getElementById("username-display");

// Verificar se o usuário está autenticado
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const uid = user.uid;
        const userDoc = doc(db, "users", uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            usernameDisplay.textContent = data.username || "Usuário";
        } else {
            console.log("Nenhum documento encontrado!");
        }
    } else {
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
    loadBooks("disponível");
});

document.getElementById("rented-books").addEventListener("click", () => {
    loadBooks("locado");
});

document.getElementById("overdue-books").addEventListener("click", () => {
    loadBooks("atrasado");
});

// Função para carregar livros de acordo com o status
async function loadBooks(status) {
    const booksSnapshot = await getDocs(collection(db, "books"));
    const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Atualiza status para "atrasado" se a data de devolução tiver expirado
    const today = new Date().toISOString().split("T")[0]; // Data de hoje no formato YYYY-MM-DD
    for (const book of books) {
        if (book.status === "locado" && book.returnDate < today) {
            book.status = "atrasado";
            await updateDoc(doc(db, "books", book.id), { status: "atrasado" });
        }
    }

    const filteredBooks = books.filter(book => book.status === status);

    let htmlContent = `<h2>Livros ${status.charAt(0).toUpperCase() + status.slice(1)}s</h2><table><tr><th>Nome</th><th>Autor</th><th>Ano</th><th>Gênero</th><th>Páginas</th><th>Localização</th><th>Status</th><th>Locatário</th><th>Data de Devolução</th><th>Ações</th></tr>`;
    filteredBooks.forEach(book => {
        htmlContent += `
            <tr>
                <td><a href="#" class="edit-book" data-id="${book.id}">${book.name}</a></td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>${book.genre}</td>
                <td>${book.pages}</td>
                <td>${book.location}</td>
                <td>${book.status}</td>
                <td>${book.renter || "N/A"}</td>
                <td>${book.returnDate || "N/A"}</td>
                <td><button class="delete-book" data-id="${book.id}">Excluir</button></td>
            </tr>`;
    });
    htmlContent += `</table>`;

    document.getElementById("content").innerHTML = htmlContent;

    // Adicionar evento de clique para editar livros
    const editLinks = document.querySelectorAll(".edit-book");
    editLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const bookId = link.getAttribute("data-id");
            editBook(bookId);
        });
    });

    // Adicionar evento de clique para excluir livros
    const deleteButtons = document.querySelectorAll(".delete-book");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const bookId = button.getAttribute("data-id");
            await deleteBook(bookId);
            loadBooks(status); // Atualiza a lista após a exclusão
        });
    });
}

// Exibir formulário de cadastro de livros
document.getElementById("register-book").addEventListener("click", () => {
    document.getElementById("content").innerHTML = `
        <h2>Cadastrar Novo Livro</h2>
        <form id="book-form">
            <label for="book-name">Nome do Livro:</label>
            <input type="text" id="book-name" placeholder="Digite o nome do livro" required>
            <label for="book-author">Autor:</label>
            <input type="text" id="book-author" placeholder="Digite o nome do autor" required>
            <label for="book-year">Ano de Publicação:</label>
            <input type="number" id="book-year" placeholder="Ex.: 2021" required>
            <label for="book-genre">Gênero:</label>
            <input type="text" id="book-genre" placeholder="Ex.: Ficção, Aventura" required>
            <label for="book-pages">Número de Páginas:</label>
            <input type="number" id="book-pages" placeholder="Ex.: 300" required>
            <label for="book-location">Localização:</label>
            <input type="text" id="book-location" placeholder="Ex.: Estante A, Prateleira 2" required>
            <label for="book-status">Status de Locação:</label>
            <select id="book-status">
                <option value="disponível">Disponível</option>
                <option value="locado">Locado</option>
                <option value="atrasado">Em Atraso</option>
            </select>
            <button type="submit">Cadastrar Livro</button>
        </form>
    `;

    // Adicionar lógica para enviar os dados do livro ao Firestore
    document.getElementById("book-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const bookData = {
            name: document.getElementById("book-name").value,
            author: document.getElementById("book-author").value,
            year: document.getElementById("book-year").value,
            genre: document.getElementById("book-genre").value,
            pages: document.getElementById("book-pages").value,
            location: document.getElementById("book-location").value,
            status: document.getElementById("book-status").value,
        };

        try {
            await setDoc(doc(db, "books", bookData.name), bookData);
            const successMessage = document.createElement('div');
            successMessage.className = 'alert success';
            successMessage.textContent = "Livro cadastrado com sucesso!";
            document.getElementById("content").prepend(successMessage);
            document.getElementById("book-form").reset();
        } catch (error) {
            console.error("Erro ao cadastrar livro:", error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert error';
            errorMessage.textContent = "Erro ao cadastrar livro. Tente novamente.";
            document.getElementById("content").prepend(errorMessage);
        }
    });
});

// Função para editar informações do livro
async function editBook(bookId) {
    const bookDoc = doc(db, "books", bookId);
    const bookSnapshot = await getDoc(bookDoc);
    const bookData = bookSnapshot.data();

    // Monta o HTML do formulário
    document.getElementById("content").innerHTML = `
        <h2>Editar Livro: ${bookData.name}</h2>
        <form id="edit-book-form">
            <label for="edit-book-name">Nome do Livro:</label>
            <input type="text" id="edit-book-name" value="${bookData.name}" required>
            <label for="edit-book-author">Autor:</label>
            <input type="text" id="edit-book-author" value="${bookData.author}" required>
            <label for="edit-book-year">Ano de Publicação:</label>
            <input type="number" id="edit-book-year" value="${bookData.year}" required>
            <label for="edit-book-genre">Gênero:</label>
            <input type="text" id="edit-book-genre" value="${bookData.genre}" required>
            <label for="edit-book-pages">Número de Páginas:</label>
            <input type="number" id="edit-book-pages" value="${bookData.pages}" required>
            <label for="edit-book-location">Localização:</label>
            <input type="text" id="edit-book-location" value="${bookData.location}" required>
            <label for="edit-book-status">Status de Locação:</label>
            <select id="edit-book-status">
                <option value="disponível" ${bookData.status === 'disponível' ? 'selected' : ''}>Disponível</option>
                <option value="locado" ${bookData.status === 'locado' ? 'selected' : ''}>Locado</option>
                <option value="atrasado" ${bookData.status === 'atrasado' ? 'selected' : ''}>Em Atraso</option>
            </select>
            <label id="renter-label" for="renter-name" ${bookData.status === 'disponível' ? 'style="display: none;"' : ''}>Locatário:</label>
            <input id="renter-name" type="text" value="${bookData.renter || ''}" placeholder="Nome do locatário" ${bookData.status === 'disponível' ? 'style="display: none;"' : ''} />
            <label id="return-date-label" for="return-date" ${bookData.status === 'disponível' ? 'style="display: none;"' : ''}>Data de Devolução:</label>
            <input id="return-date" type="date" value="${bookData.returnDate || ''}" ${bookData.status === 'disponível' ? 'style="display: none;"' : ''} />
            <button type="submit">Salvar Alterações</button>
        </form>
    `;

    // Atualizar ocultação de campos ao mudar o status
    document.getElementById("edit-book-status").addEventListener("change", (event) => {
        const status = event.target.value;
        document.getElementById("renter-label").style.display = (status === "disponível") ? "none" : "block";
        document.getElementById("renter-name").style.display = (status === "disponível") ? "none" : "block";
        document.getElementById("return-date-label").style.display = (status === "disponível") ? "none" : "block";
        document.getElementById("return-date").style.display = (status === "disponível") ? "none" : "block";
    });

    // Lógica para editar livro
    document.getElementById("edit-book-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const updatedData = {
            name: document.getElementById("edit-book-name").value,
            author: document.getElementById("edit-book-author").value,
            year: document.getElementById("edit-book-year").value,
            genre: document.getElementById("edit-book-genre").value,
            pages: document.getElementById("edit-book-pages").value,
            location: document.getElementById("edit-book-location").value,
            status: document.getElementById("edit-book-status").value,
            renter: document.getElementById("renter-name").value || null,
            returnDate: document.getElementById("return-date").value || null,
        };

        await updateDoc(bookDoc, updatedData);
        const successMessage = document.createElement('div');
        successMessage.className = 'alert success';
        successMessage.textContent = "Livro atualizado com sucesso!";
        document.getElementById("content").prepend(successMessage);
        
        loadBooks(updatedData.status); // Atualiza a lista após a edição
    });
}

// Função para excluir livro
async function deleteBook(bookId) {
    await setDoc(doc(db, "books", bookId), {
        name: "", // ou qualquer dado que você queira limpar
        author: "",
        year: "",
        genre: "",
        pages: "",
        location: "",
        status: "disponível",
        renter: null,
        returnDate: null
    });
    const successMessage = document.createElement('div');
    successMessage.className = 'alert success';
    successMessage.textContent = "Livro excluído com sucesso!";
    document.getElementById("content").prepend(successMessage);
}

// Inicializa com livros disponíveis
loadBooks("disponível");

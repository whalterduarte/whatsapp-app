// Seleciona os botões de "Sign Up" e "Sign In" e o container principal
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

// Adiciona um listener para o botão "Sign Up" que ativa o painel de registro
signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// Adiciona um listener para o botão "Sign In" que remove o painel de registro
signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

// Configuração do Toast (mensagem de alerta)
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
});

// Exibe um Toast de boas-vindas à página de login
Toast.fire({
    icon: "success",
    title: "Bem-vindo à página de login",
});

// Formulário de cadastro (signupForm)
const signupForm = document.getElementById("signUpForm");
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Coleta os dados do formulário de registro
    const payload = {
        name: signupForm.signUpName.value,
        email: signupForm.signUpEmail.value,
        password: signupForm.signUpPassword.value,
        picture:
            signupForm.signUpUrl.value == ""
                ? "https://static.vecteezy.com/system/resources/previews/005/544/718/original/profile-icon-design-free-vector.jpg"
                : signupForm.signUpUrl.value,
    };
    // Chama a função de registro com os dados coletados
    register(payload);
});

// Função para enviar os dados de registro para o servidor
const register = async (payload) => {
    try {
        // Realiza uma requisição POST para o endpoint de registro do usuário
        const res = await fetch("http://localhost:8080/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        // Converte a resposta para JSON
        let data = await res.json();
        // Verifica se o registro foi bem-sucedido
        if (data.success) {
            // Exibe um Toast de sucesso
            Toast.fire({
                icon: "success",
                title: "Usuário criado com sucesso",
            });
            // Limpa os campos do formulário de registro
            signupForm.signUpName.value = "";
            signupForm.signUpEmail.value = "";
            signupForm.signUpPassword.value = "";
            signupForm.signUpUrl.value = "";
        } else {
            // Exibe um Toast de erro com a mensagem do servidor
            Toast.fire({
                icon: "error",
                title: data.error,
            });
        }
    } catch (error) {
        // Em caso de erro, exibe um modal de erro genérico
        Swal.fire({
            title: "Erro!",
            text: "Requisição inválida 404",
            icon: "error",
            confirmButtonText: "Tentar Novamente",
        });
    }
};

// Formulário de login (loginForm)
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Coleta os dados do formulário de login
    const payload = {
        email: loginForm.loginEmail.value,
        password: loginForm.loginPassword.value,
    };
    // Chama a função de login com os dados coletados
    login(payload);
});

// Função para enviar os dados de login para o servidor
const login = async (payload) => {
    try {
        // Realiza uma requisição POST para o endpoint de login do usuário
        const res = await fetch("http://localhost:8080/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Converte a resposta para JSON
        let data = await res.json();
        // Verifica se o login foi bem-sucedido
        if (data.success) {
            // Exibe um Toast de sucesso
            Toast.fire({
                icon: "success",
                title: "Logado com sucesso",
            });
            // Armazena o token de autenticação no localStorage
            localStorage.setItem("token", data.token);
            const user = data.userId;
            // Redireciona o usuário para a página de dashboard com o ID do usuário
            window.location.href = `dashboard.html?id=${user}`;
        } else {
            // Exibe um modal de erro com a mensagem do servidor
            Swal.fire({
                title: "Erro!",
                text: data.error,
                icon: "error",
                confirmButtonText: "Tentar Novamente",
            });
        }
    } catch (error) {
        // Em caso de erro, exibe um modal de erro genérico
        Swal.fire({
            title: "Erro!",
            text: "Requisição inválida 404",
            icon: "error",
            confirmButtonText: "Tentar Novamente",
        });
    }
};

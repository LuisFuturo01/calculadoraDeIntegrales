document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.querySelector('.contenedor');
    if (contenedor) {
        contenedor.style.opacity = '0';
        contenedor.style.transform = 'translateY(20px)';
        setTimeout(() => {
            contenedor.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            contenedor.style.opacity = '1';
            contenedor.style.transform = 'translateY(0)';
        }, 100);
    }

    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]'); // Incluye input type number
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.transition = 'box-shadow 0.3s ease';
            input.style.boxShadow = '0 0 0 4px rgba(97, 218, 251, 0.5)'; // Color de enfoque
        });
        input.addEventListener('blur', () => {
            input.style.boxShadow = 'none';
        });
    });
});

//modal
const helpButton = document.getElementById("help_button");
const helpModal = document.getElementById("help_modal");
const modalContent = document.getElementById("modalContent");
const closeSpan = helpModal.querySelector("span");

// Lista de ayudas (puedes agregar más)
const helpItems = [
    { palabra: "x**2", descripcion: "Potencia: x al cuadrado." },
    { palabra: "x**n", descripcion: "x elevado a la potencia n." },
    { palabra: "exp(x)", descripcion: "Exponencial de x (e^x)." },
    { palabra: "log(x)", descripcion: "Logaritmo natural de x (base e), igual que ln(x)." },
    { palabra: "ln(x)", descripcion: "Logaritmo natural de x (base e)." },
    { palabra: "log(x, b)", descripcion: "Logaritmo de x en base b." },
    { palabra: "sqrt(x)", descripcion: "Raíz cuadrada de x." },
    { palabra: "abs(x)", descripcion: "Valor absoluto de x." },
    { palabra: "sin(x)", descripcion: "Seno de x (en radianes)." },
    { palabra: "cos(x)", descripcion: "Coseno de x (en radianes)." },
    { palabra: "tan(x)", descripcion: "Tangente de x (en radianes)." },
    { palabra: "cot(x)", descripcion: "Cotangente de x." },
    { palabra: "sec(x)", descripcion: "Secante de x." },
    { palabra: "csc(x)", descripcion: "Cosecante de x." },
    { palabra: "asin(x)", descripcion: "Arco seno de x." },
    { palabra: "acos(x)", descripcion: "Arco coseno de x." },
    { palabra: "atan(x)", descripcion: "Arco tangente de x." },
    { palabra: "sinh(x)", descripcion: "Seno hiperbólico de x." },
    { palabra: "cosh(x)", descripcion: "Coseno hiperbólico de x." },
    { palabra: "tanh(x)", descripcion: "Tangente hiperbólica de x." },
    { palabra: "gamma(x)", descripcion: "Función gamma de x (generalización del factorial)." },
    { palabra: "factorial(x)", descripcion: "Factorial de x (x!)." },
    { palabra: "Heaviside(x)", descripcion: "Función escalón de Heaviside." },
    { palabra: "DiracDelta(x)", descripcion: "Delta de Dirac." },
    { palabra: "pi", descripcion: "Constante π ≈ 3.1416." },
    { palabra: "E", descripcion: "Constante e ≈ 2.7182." },
    { palabra: "oo", descripcion: "Infinito positivo (puedes usar 'inf' o 'oo')." },
    { palabra: "-oo", descripcion: "Infinito negativo (puedes usar '-inf' o '-oo')." }
];

helpButton.addEventListener("click", (e) => {
    e.preventDefault();
    modalContent.innerHTML = `
        <h2 style="margin-top:0;margin-bottom:18px;font-size:1.3em;color:var(--color-resaltado-primario);">Ayuda de funciones</h2>
        <ul class="help-list">
            ${helpItems.map(item => `<li><strong>${item.palabra}:</strong> ${item.descripcion}</li>`).join("")}
        </ul>
    `;
    helpModal.style.display = "flex";
    document.body.classList.add("noScroll");
});

closeSpan.addEventListener("click", (e) => {
    e.stopPropagation();
    helpModal.style.display = "none";
    document.body.classList.remove("noScroll");
});

// Cerrar al hacer clic fuera del modalContent
helpModal.addEventListener("mousedown", (e) => {
    if (!modalContent.contains(e.target)) {
        helpModal.style.display = "none";
        document.body.classList.remove("noScroll");
    }
});
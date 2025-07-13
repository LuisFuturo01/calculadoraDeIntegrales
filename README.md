# Calculadora de Integrales - UMSA

Una aplicación web para el cálculo de integrales definidas e indefinidas, desarrollada para la Facultad de Informática de la Universidad Mayor de San Andrés (UMSA).

## 🔧 Características

- **Cálculo de integrales**: Integrales definidas e indefinidas con SymPy
- **Previsualización en tiempo real**: Vista previa de la función ingresada en LaTeX
- **Visualización matemática**: Renderizado LaTeX con MathJax
- **Gráficas interactivas**: Integración con GeoGebra para visualizar funciones y áreas
- **Interfaz intuitiva**: Diseño responsive con modo oscuro
- **Límites flexibles**: Soporte para límites numéricos e infinitos
- **Análisis estadístico**: Seguimiento del rendimiento estudiantil

## 🚀 Instalación

### Requisitos previos
- Python 3.8+
- Navegador web moderno con conexión a internet (para GeoGebra)

### Configuración
1. Clona el repositorio:
   ```bash
   git clone https://github.com/LuisFuturo01/calculadoraDeIntegrales.git
   cd calculadoraDeIntegrales
   ```

2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Ejecuta la aplicación:
   ```bash
   python app.py
   ```

4. Abre tu navegador en `http://localhost:5000`

## 📚 Uso

### Calculadora de Integrales
1. **Ingresa tu función**: Usa sintaxis de Python como `x**2`, `sin(x)`, `exp(x)`, etc.
2. **Configura límites (opcional)**: Para integrales definidas, especifica límites inferior y superior
3. **Selecciona variable**: Por defecto usa `x`, pero puedes cambiarlo
4. **Ajusta decimales**: Controla la precisión del resultado numérico (0-15 decimales)
5. **Calcula**: Obtén integral indefinida, definida y visualización gráfica

### Sintaxis Soportada
- **Potencias**: `x**2`, `x**3`
- **Funciones trigonométricas**: `sin(x)`, `cos(x)`, `tan(x)`
- **Funciones exponenciales**: `exp(x)`, `log(x)`
- **Constantes**: `pi`, `e`
- **Infinito**: `inf`, `-inf`
- **Multiplicación implícita**: `2*x` o `2x`

### Ejemplos de Funciones
```
x**2 + 3*x + 1
sin(x)*cos(x)
exp(x)/x
1/(1+x**2)
x*exp(-x**2)
```

### Límites de Integración
- **Numéricos**: `0`, `1`, `-2`, `3.14`
- **Infinitos**: `inf`, `-inf`
- **Vacío**: Deja vacío para integral indefinida

## 🏗️ Estructura del Proyecto

```
calculadoraDeIntegrales/
├── app.py                 # Servidor Flask con endpoints
├── index.html            # Página principal de la calculadora
├── style.css            # Estilos CSS con tema oscuro
├── script.js             # Lógica principal de la calculadora
├── interactions.js       # Interacciones de usuario y ayuda
├── estadistica.html      # Página de estadísticas estudiantiles
├── estadistica.css      # Página de estadísticas estudiantiles
├── estadistica.js        # Lógica de gráficos estadísticos
├── requirements.txt     # Dependencias Python
├── form.html        # Sitio donde se agrega los datos de los estudiantes
├── form.css        # Estilos del formulario, tematica dark
├── form.js        # Conexion a firebase, y envio de información, logica general
├── form.css        # Conexion a firebase, y envio de información, logica general
├── README.md           # Este archivo
└── .gitignore          # Archivos a ignorar en Git
```

## 🔬 Tecnologías Utilizadas

### Backend
- **Flask 3.0.0**: Framework web de Python
- **SymPy 1.12**: Biblioteca de matemáticas simbólicas para cálculos

### Frontend
- **HTML5/CSS3**: Estructura y estilos con tema oscuro
- **JavaScript ES6+**: Lógica del cliente
- **MathJax 3**: Renderizado de ecuaciones matemáticas en LaTeX
- **GeoGebra**: Visualizaciones gráficas interactivas
- **Chart.js**: Gráficos estadísticos
- **FIrebase**: Base de datos no SQL para los datos estadistivos

## 🎯 Funcionalidades Principales

### Calculadora
- **Integral indefinida**: Con constante de integración `+ C`
- **Integral definida**: Con límites numéricos e infinitos
- **Previsualización**: Renderizado LaTeX en tiempo real
- **Manejo de errores**: Mensajes informativos para sintaxis incorrecta
- **Evaluación numérica**: Resultados decimales configurables

### Visualización
- **Renderizado LaTeX**: Ecuaciones matemáticas profesionales
- **Gráficas interactivas**: Funciones y áreas bajo la curva
- **Interfaz responsive**: Optimizada para dispositivos móviles
- **Tema oscuro**: Diseño moderno y cómodo para la vista

### Estadísticas
- **Análisis de rendimiento**: Comparativa entre exámenes
- **Seguimiento de uso**: Impacto de herramientas en las notas
- **Gráficos interactivos**: Visualización de datos estudiantiles
- **Métricas múltiples**: Asistencia, tiempo de estudio, ejercicios resueltos

## 🔧 API Endpoints

### `GET /`
Sirve la página principal de la calculadora

### `POST /previsualizar_funcion`
Previsualiza una función en formato LaTeX
```json
{
  "funcion": "x**2 + sin(x)"
}
```

### `POST /calcular_integral`
Calcula integrales definidas e indefinidas
```json
{
  "funcion": "x**2",
  "variable": "x",
  "limite_inferior": "0",
  "limite_superior": "1",
  "decimales": 2
}
```

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

Este proyecto está desarrollado para fines educativos en la Facultad de Informática - UMSA.

## 👥 Autores

- Desarrollado para el curso INF-126
- Facultad de Informática - UMSA
- 2025

## 🐛 Problemas Conocidos

- GeoGebra requiere conexión a internet para funcionar
- Algunas funciones muy complejas pueden tardar en procesarse
- Los límites infinitos no se pueden graficar directamente en GeoGebra

## 🔄 Próximas Mejoras

- [ ] Soporte para integrales múltiples
- [ ] Más funciones matemáticas especiales
- [ ] Exportación de resultados a PDF
- [ ] Modo offline para visualizaciones
- [ ] Historial de cálculos realizados

---

Para más información, contacta con la Facultad de Informática - UMSA.

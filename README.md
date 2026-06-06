# Quiz Test - Aplicacion para Practicar

## Descripcion

Aplicacion web sencilla para practicar conocimientos de desarrollo web, bases de datos y seguridad. El proyecto incluye un cuestionario con preguntas de opcion multiple y un glosario de terminos tecnicos.

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome 6
- JSON (almacenamiento de preguntas)
- LocalStorage (persistencia de progreso)

## Caracteristicas

- Cuestionario con preguntas aleatorias
- Verificacion instantanea de respuestas
- Feedback visual con colores (verde para correcto, rosa para incorrecto)
- Persistencia del progreso al cerrar el navegador
- Glosario de terminos tecnicos organizado alfabeticamente
- Navegacion lateral minimalista
- Diseno responsive para dispositivos moviles

## Como Usar

1. Clona o descarga el repositorio
2. Abre el archivo `index.html` en tu navegador web
3. Selecciona una respuesta para cada pregunta
4. El sistema verificara automaticamente si es correcta
5. Usa los botones Anterior y Siguiente para navegar
6. Consulta el glosario para repasar conceptos
7. El progreso se guarda automaticamente

## Estructura del Proyecto

```
test-app/
├── index.html          # Pagina principal del cuestionario
├── glossary.html       # Pagina del glosario
├── style.css          # Estilos de la aplicacion
├── app.js             # Logica del cuestionario
├── menu.js            # Menu lateral de navegacion
├── data/
│   └── questions.json # Base de datos de preguntas
└── README.md          # Documentacion
```

## Personalizacion

### Agregar Preguntas

Edita el archivo `data/questions.json` siguiendo el formato:

```json
{
  "text": "Texto de la pregunta",
  "options": [
    "Opcion A",
    "Opcion B", 
    "Opcion C",
    "Opcion D"
  ],
  "correct": "a"
}
```

La letra en `correct` debe coincidir con la posicion de la opcion correcta (a, b, c o d).

### Modificar Colores

Los colores principales se encuentran en `style.css`:

- Azul: #6fa8dc
- Verde: #a8dc6f
- Rosa: #dc6fa8
- Fondo: #1E293B

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexion a internet (para cargar Font Awesome)

## Nota

Este proyecto es solo para fines educativos y de practica. No requiere instalacion de servidor ni base de datos, funciona completamente en el navegador.

## Estado del Proyecto

En desarrollo activo. Se pueden agregar mas preguntas y funcionalidades segun sea necesario.
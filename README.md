# KeyGen Pro - Generador de Contraseñas Seguras

Una aplicación web moderna y profesional para generar contraseñas seguras con gestión de usuarios.

## Características

- **Generador de contraseñas personalizable** con opciones de longitud y tipos de caracteres
- **Indicador visual de fuerza** de contraseñas en tiempo real
- **Gestión de usuarios** con búsqueda y eliminación
- **Interfaz moderna** con diseño glassmorphism y animaciones suaves
- **Sistema de modales** para notificaciones y confirmaciones
- **Estadísticas en tiempo real** sobre usuarios y contraseñas
- **Responsive design** que se adapta a todos los dispositivos

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Almacenamiento**: JSON local
- **Despliegue**: Netlify

## Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/yourusername/keygen-pro.git
   cd keygen-pro
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador**
   - La aplicación estará disponible en http://localhost:3000

## Despliegue en Netlify

### Paso 1: Crear Repositorio en GitHub

1. Crea un nuevo repositorio en GitHub llamado `keygen-pro`
2. Reemplaza `yourusername` en el archivo `package.json` con tu nombre de usuario de GitHub

### Paso 2: Conectar con Netlify

1. Ve a [Netlify](https://app.netlify.com/drop)
2. Arrastra la carpeta del proyecto o conéctalo a tu repositorio de GitHub
3. Configura las siguientes opciones:

**Build Settings:**
- **Build command**: `npm install && npm run build`
- **Publish directory**: `public`
- **Node version**: `18`

**Environment Variables:**
- `NODE_VERSION`: `18`

### Paso 3: Configurar Dominio (Opcional)

1. Ve a **Domain settings** en Netlify
2. Cambia el dominio predeterminado a uno personalizado si lo deseas
3. Actualiza el campo `homepage` en `package.json` con tu nuevo dominio

## Archivos de Configuración

### `netlify.toml`
Configuración de despliegue para Netlify con:
- Comandos de build
- Versiones de Node.js
- Redirecciones para API
- Headers de seguridad

### `.gitignore`
Excluye archivos innecesarios del control de versiones:
- `node_modules/`
- Archivos de logs
- Archivos de configuración local
- Archivos temporales

## Estructura del Proyecto

```
keygen-pro/
    public/
        index.html          # Página principal
        script.js           # Lógica del frontend
    server.js              # Servidor Express
    database.js            # Gestión de base de datos
    keyGen.js              # Generador de contraseñas
    package.json           # Dependencias y scripts
    netlify.toml           # Configuración de Netlify
    .gitignore             # Archivos ignorados por Git
    README.md              # Documentación
    users.json             # Base de datos de usuarios
```

## API Endpoints

- `GET /api/users` - Obtener todos los usuarios
- `POST /api/users` - Crear nuevo usuario
- `DELETE /api/users` - Eliminar usuario
- `POST /api/generate` - Generar contraseña
- `GET /api/stats` - Obtener estadísticas

## Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
- Crea un issue en GitHub
- Contacta al desarrollador

---

**Desarrollado con amor por KeyGen Pro** © 2024

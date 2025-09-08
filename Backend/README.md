# 💉 Clínica Rejuvenezk

Sistema integral de gestión para una clínica estética, 
desarrollado como proyecto final en el SENA para optar por el título de **Desarrollador de Software**.

## 🧾 Descripción

**Clínica Rejuvenezk** es una aplicación web full-stack que permite gestionar usuarios, doctores, asistentes, historial médico, citas, servicios estéticos y procedimientos, integrando herramientas modernas de desarrollo backend y frontend con soporte en tiempo real, seguridad y escalabilidad.

---

## 👥 Autores

Desarrollado por:
- Darwin
- Liliana
- Constanza

---

## ⚙️ Stack Tecnológico

### 🔙 Backend
- **Node.js** 20.x con **Express.js** 5.1.0
- **MySQL** con **Sequelize ORM** 6.37.7
- **Redis** para cache y manejo de sesiones
- **Socket.IO** 4.8.1 para notificaciones en tiempo real
- **Cloudinary** para almacenamiento de imágenes
- **Nodemailer** para envío de correos

### 🔜 Frontend
- **React** con **Vite**
- **React Router DOM** para navegación
- **Bootstrap Icons** para iconografía

---

## 📦 Funcionalidades Principales

### 🔐 Sistema de Roles
- **Doctor**:
  - Registra servicios de la clínica
  - Crea y gestiona citas
  - Visualiza y edita historiales médicos
  - Visualiza documentos externos de los pacientes

- **Usuario (Paciente)**:
  - Registra y edita su historial clínico
  - Solicita servicios y agenda citas (primera cita obligatoria tipo evaluación)
  - Sube documentos externos para evaluación
  - Cancela y edita citas
  - Visualiza notificaciones

- **Asistente**:
  - Registra procedimientos **solo si el médico lo autoriza**

### 🗃️ Módulos del Sistema
- Gestión de usuarios con autenticación JWT
- Módulo de historial médico completo
- Citas médicas y procedimientos
- Carrito de compras y órdenes
- Notificaciones en tiempo real vía Socket.IO
- Subida y almacenamiento de documentos en la nube
- Seguridad por tokens, roles y control de acceso

---

## 🛠️ Instalación y Configuración

### 📋 Requisitos
- Node.js 20.x
- MySQL
- Docker (para Redis)

### 🔧 Backend

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Insertar datos iniciales
npx sequelize-cli db:seed:all

# Iniciar servidor en desarrollo
npm run dev
```

##🔑 Variables de Entorno

Ubicadas en `.env.example`, incluye configuración para:

- Base de datos (MySQL)
- Redis
- JWT_SECRET
- Cloudinary (Cloud storage)
- Datos del administrador por defecto
- Configuración de Nodemailer para correos
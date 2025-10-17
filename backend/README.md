# KAPA Backend - API NestJS<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>

Backend RESTful API para el sistema KAPA de gestión documental.</p>



## 🚀 Stack Tecnológico[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

- **Framework:** NestJS v10

- **Lenguaje:** TypeScript 5.1  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- **Base de Datos:** PostgreSQL 14    <p align="center">

- **ORM:** TypeORM<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

- **Autenticación:** Passport (JWT + Local)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

- **Email:** Nodemailer + SendGrid<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

- **Testing:** Jest<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>

## 📦 Instalación<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

```bash<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

npm install  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>

```    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>

## ⚙️ Configuración</p>

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

Crear archivo `.env` en la raíz del backend:  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->



```env## Description

DATABASE_HOST=localhost

DATABASE_PORT=5432[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

DATABASE_USER=admin

DATABASE_PASSWORD=tu_password## Installation

DATABASE_NAME=kapa_db

JWT_SECRET=tu_secret_jwt```bash

JWT_EXPIRES_IN=5000s$ npm install

MAIL_HOST=smtp.sendgrid.net```

MAIL_PORT=587

MAIL_USER=apikey## Running the app

MAIL_PASS=tu_sendgrid_key

MAIL_FROM=tu_email@dominio.com```bash

RECAPTCHA_SECRET_KEY=tu_recaptcha_key# development

PORT=3000$ npm run start

URL_FRONT=http://localhost:8080

```# watch mode

$ npm run start:dev

## 🏃 Ejecutar

# production mode

### Desarrollo$ npm run start:prod

```bash```

npm run start:dev

```## Test



### Producción```bash

```bash# unit tests

npm run build$ npm run test

npm run start:prod

```# e2e tests

$ npm run test:e2e

## 🧪 Testing

# test coverage

```bash$ npm run test:cov

# Unit tests```

npm run test

## Support

# E2E tests

npm run test:e2eNest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).



# Coverage## Stay in touch

npm run test:cov

```- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)

- Website - [https://nestjs.com](https://nestjs.com/)

## 📁 Estructura de Módulos- Twitter - [@nestframework](https://twitter.com/nestframework)



```## License

src/

├── modules/Nest is [MIT licensed](LICENSE).

│   ├── auth/                  # Autenticación JWT
│   ├── users/                 # Gestión de usuarios
│   ├── roles/                 # Roles y permisos
│   ├── clients/               # Clientes
│   ├── projects/              # Proyectos
│   ├── contractors/           # Contratistas
│   ├── employees/             # Empleados
│   ├── criterion/             # Criterios
│   ├── subcriterion/          # Subcriterios
│   ├── documents/             # Documentos
│   ├── project-contractors/
│   └── project-contractor-criterions/
├── database/
│   └── entities/              # 14 entidades TypeORM
├── common/
│   ├── guards/               # Auth guards
│   └── utils/                # Utilidades
└── main.ts
```

## 🔌 API Endpoints

Ver documentación completa en el README principal del proyecto.

## 📊 Base de Datos

Para crear la BD desde el dump:

```bash
psql -U admin -d kapa_db -f ../database.sql
```

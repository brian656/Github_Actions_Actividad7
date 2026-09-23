# Backend de seguridad web

API REST educativa construida con Node.js, Express y módulos ES. Usa una lista en memoria, por lo que los usuarios se pierden al reiniciar el servidor.

## Instalación

En PowerShell:

```powershell
cd "d:\Back end y front end\frontend\actividad3_grupo3\backend"
Copy-Item .env.example .env
notepad .env
npm install
```

En `.env`, cambia `JWT_SECRET` por una clave larga. `ADMIN_EMAIL` y `ADMIN_PASSWORD` son opcionales y crean un administrador temporal para probar la ruta admin.

## Ejecución

```powershell
npm start
# Desarrollo con reinicio automático:
npm run dev
```

La API queda disponible en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Protección |
| --- | --- | --- |
| GET | `/api/health` | Pública |
| POST | `/api/isterauth/reg` | Pública, validación Joi |
| POST | `/api/auth/login` | Pública, validación Joi y rate limit |
| GET | `/api/user` | JWT válido |
| GET | `/api/admin` | JWT válido y rol `admin` |

## Ejemplos en PowerShell

```powershell
$body = @{ name = "Ana"; email = "ana@example.com"; password = "Ana12345!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/register -ContentType "application/json" -Body $body

$login = @{ email = "ana@example.com"; password = "Ana12345!" } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body $login
$token = $response.token

Invoke-RestMethod -Uri http://localhost:3000/api/user -Headers @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:3000/api/admin -Headers @{ Authorization = "Bearer $token" }
```

Para probar admin, inicia sesión usando los valores `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env` y usa su token contra `/api/admin`.

## Controles de seguridad

- **bcrypt:** almacena únicamente un hash de la contraseña con coste 12; las contraseñas no aparecen en respuestas ni logs.
- **JWT:** el login entrega un token firmado que expira en una hora; `verifyToken` valida su firma y expiración.
- **Roles:** el registro público asigna `usuario`; `/api/admin` exige el rol `admin`.
- **express-rate-limit:** limita login a 5 intentos por IP cada 15 minutos.
- **Joi:** valida formato, longitud y campos obligatorios de registro y login.
- **Helmet:** añade cabeceras HTTP defensivas.
- **CORS:** solo permite solicitudes desde `http://localhost:5173`.
- **dotenv:** mantiene `PORT` y `JWT_SECRET` fuera del código fuente.
- **Winston:** registra registros, logins exitosos/fallidos y accesos denegados en `logs/security.log`, sin contraseñas.
- **Errores:** un middleware centralizado evita respuestas internas detalladas y cubre rutas inexistentes.

## Pruebas de los controles

1. Registra un usuario válido y confirma que el usuario creado tiene rol `usuario`.
2. Envía un password corto o un correo inválido y verifica la respuesta `400` de Joi.
3. Haz login con password incorrecto y revisa `401` y el archivo `logs/security.log`.
4. Repite seis logins fallidos dentro de 15 minutos y verifica `429`.
5. Llama `/api/user` sin `Authorization`, con un token alterado y con un token correcto; deben producir `401`, `401` y `200`.
6. Usa el token de usuario en `/api/admin` y verifica `403`; usa el token del admin temporal y verifica `200`.
7. Revisa las cabeceras de la respuesta y confirma las de Helmet. Prueba un `Origin` distinto y verifica que CORS no lo autoriza.
8. Usa Postman o Thunder Client con los mismos métodos, URLs, cuerpos JSON y header `Authorization: Bearer <token>`.
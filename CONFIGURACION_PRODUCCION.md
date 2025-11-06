# 🚀 Configuración de Producción - KAPA

## ⚠️ IMPORTANTE: Configuración AWS S3 Requerida

Para que el sistema funcione en producción en `https://kapa.healtheworld.com.co/`, necesitas configurar AWS S3 con credenciales reales.

### 🔧 Pasos para configurar AWS S3:

#### 1. Crear bucket S3
```bash
# Ir a AWS Console: https://aws.amazon.com/console/
# Crear bucket con nombre: kapa-healtheworld-documents
# Región: us-east-1
# Configuración de acceso público: Bloqueado (recomendado)
```

#### 2. Configurar CORS en el bucket
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://kapa.healtheworld.com.co", "http://localhost:*"],
        "ExposeHeaders": []
    }
]
```

#### 3. Crear usuario IAM
```bash
# Crear usuario: kapa-production-user
# Tipo de acceso: Acceso programático
# Sin acceso a consola de AWS
```

#### 4. Política IAM para el usuario
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::kapa-healtheworld-documents/*",
                "arn:aws:s3:::kapa-healtheworld-documents"
            ]
        }
    ]
}
```

#### 5. Obtener credenciales
- Access Key ID: AKIAXXXXXXXXXXXXXXXXX
- Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

### 📝 Actualizar variables de entorno

#### Frontend (.env) - YA CONFIGURADO:
```bash
VITE_API_BASE_URL=https://kapa.healtheworld.com.co/api
VITE_AWS_BUCKET_REGION=us-east-1
VITE_AWS_PUBLIC_KEY=[TU_ACCESS_KEY_ID_REAL]
VITE_AWS_SECRET_KEY_S3=[TU_SECRET_ACCESS_KEY_REAL]
VITE_AWS_BUCKET_NAME=kapa-healtheworld-documents
```

#### Backend (.env) - YA CONFIGURADO:
```bash
URL_FRONT=https://kapa.healtheworld.com.co
PORT=3001
```

### 🎯 Estado Actual del Sistema:

✅ **Modo desarrollo REMOVIDO**
✅ **S3Manager restaurado para producción**
✅ **URLs de API configuradas para producción**
✅ **Componentes configurados para archivos reales**
✅ **Sistema de previsualización listo para archivos reales**

### 📋 TODO MANUAL:

1. **Obtener credenciales AWS reales**
2. **Reemplazar en frontend/.env:**
   - VITE_AWS_PUBLIC_KEY
   - VITE_AWS_SECRET_KEY_S3
3. **Verificar que la base de datos tiene archivos reales**
4. **Probar subida/descarga de documentos**

### 🔄 Para migrar archivos existentes:

Si tienes archivos en la base de datos pero no en S3:
1. Exportar lista de archivos desde la base de datos
2. Localizar archivos físicos en el servidor anterior
3. Subir archivos a S3 respetando la estructura de carpetas
4. Verificar que las rutas en DB coinciden con S3

### 🚨 Sin AWS configurado:

El sistema mostrará errores de "Faltan variables de entorno de configuración de AWS S3" hasta que se configuren las credenciales reales.


# Configuración de AWS S3 para KAPA

## ¿Por qué necesitamos AWS S3?

El sistema KAPA utiliza AWS S3 para:
- 📁 **Almacenamiento de documentos** (contratos, certificados, etc.)
- 🔍 **Sistema de previsualización** de archivos
- 📤 **Gestión de subida/descarga** de archivos
- 🗂️ **Organización jerárquica** por cliente/proyecto/contratista

## Configuración paso a paso

### 1. Crear cuenta y bucket S3

```bash
# 1. Ir a AWS Console: https://aws.amazon.com/console/
# 2. Crear bucket S3:
#    - Nombre: kapa-documents-[tu-empresa]
#    - Región: us-east-1 (recomendado)
#    - Configurar CORS para permitir acceso web
```

### 2. Configurar CORS en el bucket

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. Crear usuario IAM con permisos específicos

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
                "arn:aws:s3:::tu-bucket-name/*",
                "arn:aws:s3:::tu-bucket-name"
            ]
        }
    ]
}
```

### 4. Configurar variables de entorno

```bash
# Frontend (.env)
VITE_AWS_BUCKET_REGION=us-east-1
VITE_AWS_PUBLIC_KEY=AKIAIOSFODNN7EXAMPLE
VITE_AWS_SECRET_KEY_S3=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_AWS_BUCKET_NAME=kapa-documents-tu-empresa
```

## Estructura de archivos en S3

```
bucket-name/
├── cliente1/
│   └── proyecto1/
│       └── contratista1/
│           ├── ingreso/
│           │   └── criterio1/
│           │       └── subcriterio1/
│           └── empleados/
│               └── juan-perez/
└── cliente2/
    └── ...
```

## Costos estimados

- **Almacenamiento**: ~$0.023 por GB/mes
- **Transferencias**: Primeros 1GB gratis/mes
- **Solicitudes**: ~$0.0004 por 1000 solicitudes

**Estimación para uso típico**: $5-20 USD/mes

## Troubleshooting

### Error: "InvalidAccessKeyId"
```bash
# Verificar credenciales en .env
# Regenerar Access Keys en AWS IAM si es necesario
```

### Error: "Access Denied"
```bash
# Verificar permisos IAM del usuario
# Verificar configuración CORS del bucket
```

### Error: "Bucket not found"
```bash
# Verificar nombre del bucket en .env
# Verificar región del bucket
```

## Alternativas para desarrollo

Para desarrollo local sin AWS:
1. Usar **LocalStack** (emulador S3 local)
2. Implementar **almacenamiento local** temporal
3. Usar **MinIO** (S3-compatible server local)


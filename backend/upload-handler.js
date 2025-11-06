const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3002;

// Configurar CORS
app.use(cors({
  origin: 'https://kapa.healtheworld.com.co',
  credentials: true
}));

app.use(express.json());

// Configurar S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configurar conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'kapa_db',
  user: process.env.DATABASE_USER || 'admin',
  password: process.env.DATABASE_PASSWORD || 'SECURE_KAPA_DB_PASS',
});

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Endpoint para subir archivos
app.post('/upload-support-file', upload.single('file'), async (req, res) => {
  try {
    console.log('Recibiendo archivo:', req.file?.originalname);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const { displayName, category, createdBy } = req.body;

    // Generar nombre único
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `soportes-de-interes/${category}/${timestamp}_${sanitizedFileName}`;

    console.log('Subiendo a S3:', s3Key);

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: 'repositorio-documental-kapa',
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    console.log('Archivo subido exitosamente a S3');

    // Crear registro en la base de datos
    const insertQuery = `
      INSERT INTO support_file (name, display_name, category, file_path, file_size, mime_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING support_file_id, created_at, updated_at
    `;

    const fileSizeInBytes = req.file.size; // Mantener en bytes como entero

    try {
      const dbResult = await pool.query(insertQuery, [
        req.file.originalname,
        displayName,
        category,
        s3Key,
        fileSizeInBytes,
        req.file.mimetype
      ]);

      console.log('Registro creado en base de datos con ID:', dbResult.rows[0].support_file_id);

      res.json({
        message: 'Archivo subido exitosamente',
        file: {
          support_file_id: dbResult.rows[0].support_file_id,
          name: req.file.originalname,
          display_name: displayName,
          category: category,
          file_path: s3Key,
          file_size: fileSizeInBytes,
          mime_type: req.file.mimetype,
          created_at: dbResult.rows[0].created_at,
          updated_at: dbResult.rows[0].updated_at
        }
      });
    } catch (dbError) {
      console.error('Error al crear registro en base de datos:', dbError);

      // En caso de error en DB, el archivo ya está en S3 pero podríamos considerar eliminarlo
      // Por ahora, devolvemos error pero el archivo permanece en S3
      throw new Error('Error al registrar el archivo en la base de datos: ' + dbError.message);
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error al subir el archivo: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Upload handler running on http://localhost:${port}`);
});

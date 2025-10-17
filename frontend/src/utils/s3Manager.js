import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_BUCKET_REGION = import.meta.env.VITE_AWS_BUCKET_REGION;
const AWS_PUBLIC_KEY = import.meta.env.VITE_AWS_PUBLIC_KEY;
const AWS_SECRET_KEY_S3 = import.meta.env.VITE_AWS_SECRET_KEY_S3;
const AWS_BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

class S3Manager {
  constructor() {
    if (!AWS_BUCKET_REGION || !AWS_PUBLIC_KEY || !AWS_SECRET_KEY_S3 || !AWS_BUCKET_NAME) {
      throw new Error("Faltan variables de entorno de configuración de AWS S3");
    }

    this.client = new S3Client({
      region: AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY_S3,
      },
    });

    this.awsBucketName = AWS_BUCKET_NAME;
  }

  async writeFile(fileBuffer, fileName) {
    try {
      const params = {
        Bucket: this.awsBucketName,
        Key: fileName,
        Body: fileBuffer,
      };
      const command = new PutObjectCommand(params);
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      console.error("Error al escribir en S3:", error);
      throw new Error("Error al subir el archivo a S3");
    }
  }

  async readFile(fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.awsBucketName,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
      return signedUrl;
    } catch (error) {
      console.error("Error al leer desde S3:", error);
      throw new Error("Error al obtener el archivo desde S3");
    }
  }

  async deleteFile(fileName) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.awsBucketName,
        Key: fileName,
      });
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      console.error("Error al eliminar desde S3:", error);
      throw new Error("Error al eliminar el archivo desde S3");
    }
  }

  async deleteFolder(folderName) {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.awsBucketName,
        Prefix: folderName,
      });

      const listResult = await this.client.send(listCommand);

      if (listResult.Contents && listResult.Contents.length > 0) {
        const objectsToDelete = listResult.Contents.map(item => ({
          Key: item.Key,
        }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.awsBucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false,
          },
        });

        const deleteResult = await this.client.send(deleteCommand);
        return deleteResult;
      } else {
        console.error("No se encontraron objetos en la carpeta.");
        return null;
      }
    } catch (error) {
      console.error("Error al eliminar la carpeta desde S3:", error);
      throw new Error("Error al eliminar la carpeta desde S3");
    }
  }

}

export default S3Manager;

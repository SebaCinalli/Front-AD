import axios from 'axios';

// Utilidad para subir imágenes al backend usando axios
const uploadImage = async (
  entityType: string,
  entityId: number,
  file: File
): Promise<{ success: boolean; imageUrl?: string; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('imagen', file);

    const response = await axios.post(
      `${
        import.meta.env.VITE_API_URL
      }/api/${entityType}/${entityId}/upload-image`,
      formData,
      {
        withCredentials: true, // Enviar cookies de sesión
        headers: {
          'Content-Type': 'multipart/form-data', // importante para FormData
        },
      }
    );

    const result = response.data;

    // Intentar extraer el nombre del archivo de diferentes posibles ubicaciones
    const fileName =
      result.data?.foto ||
      result.data?.imagen ||
      result.data?.img ||
      result.foto ||
      result.imagen ||
      result.img ||
      result.imageUrl ||
      result.url ||
      result.fileName ||
      result.filename;

    let finalImageUrl = '';
    if (fileName && fileName.trim() !== '') {
      const baseUrls: { [key: string]: string } = {
        usuario: `${import.meta.env.VITE_API_URL}/uploads/usuarios/`,
      };

      const baseUrl = baseUrls[entityType];
      if (baseUrl) {
        finalImageUrl = `${baseUrl}${fileName}`;
      } else {
        // Si no hay baseUrl definida, usar el fileName tal como viene
        finalImageUrl = fileName;
      }
    } else {
      console.warn(
        'No se pudo extraer el nombre del archivo de la respuesta:',
        result
      );
    }

    return {
      success: true,
      imageUrl: finalImageUrl,
      message: result.message || 'Imagen subida exitosamente',
    };
  } catch (error: any) {
    console.error('Error al subir imagen:', error);

    // axios tiene estructura distinta para errores
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de conexión al subir la imagen';

    return {
      success: false,
      message,
    };
  }
};

// Función para validar tipos de archivo de imagen
export const isValidImageFile = (file: File): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validTypes.includes(file.type);
};

// Función para validar tamaño de archivo (en MB)
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Función para procesar la URL de imagen del usuario
export const processUserImageUrl = (
  imageData: string | null | undefined
): string => {
  if (!imageData || imageData.trim() === '') {
    return '';
  }

  // Si ya es una URL completa, devolverla tal como está
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  // Si es solo el nombre del archivo, construir la URL completa
  if (imageData && !imageData.includes('/')) {
    return `${import.meta.env.VITE_API_URL}/uploads/usuarios/${imageData}`;
  }

  // Si ya tiene una ruta relativa, agregarle el dominio
  if (imageData.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL}${imageData}`;
  }

  // En cualquier otro caso, asumir que es un nombre de archivo
  return `${import.meta.env.VITE_API_URL}/uploads/usuarios/${imageData}`;
};

// Función específica para subir imagen de usuario
export const uploadUsuarioImage = (usuarioId: number, file: File) =>
  uploadImage('usuario', usuarioId, file);

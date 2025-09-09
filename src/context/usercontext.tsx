import { createContext, useState, useContext, type ReactElement } from 'react';
// Nota: evitamos dependencia circular con EventDateContext aquí.
import axios from 'axios';
import { processUserImageUrl } from '../utils/imageUpload';

type User = {
  email: string;
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
  img: string;
};

type UserContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  existsToken: boolean;
  checkToken: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null);
  const [existsToken, setExistsToken] = useState<boolean>(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout del servidor para limpiar las cookies
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/usuario/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      // Siempre limpiar el estado local, incluso si falla la llamada al servidor
      setUser(null);
      setExistsToken(false);
      // No limpiamos aquí eventDate para evitar acoplamiento; se hace en UI al invocar logout
    }
  };

  const checkToken = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/usuario/verify`,
      {},
      { withCredentials: true }
    );
    if (response.status === 200 && response.data) {
      console.log('Datos del usuario desde checkToken:', response.data.user);

      const processedImageUrl = processUserImageUrl(response.data.user.img);
      console.log('URL de imagen procesada en checkToken:', processedImageUrl);

      setExistsToken(true);
      setUser({
        email: response.data.user.email,
        id: response.data.user.id,
        username: response.data.user.username,
        nombre: response.data.user.nombre,
        apellido: response.data.user.apellido,
        rol: response.data.user.rol,
        img: processedImageUrl,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{ user, login, logout, existsToken, checkToken }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider');
  return context;
};

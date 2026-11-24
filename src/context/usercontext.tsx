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
  isAuthLoading: boolean;
  checkToken: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthLoading(false);
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
      setIsAuthLoading(false);
      // No limpiamos aquí eventDate para evitar acoplamiento; se hace en UI al invocar logout
    }
  };

  const checkToken = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/usuario/verify`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        const processedImageUrl = processUserImageUrl(response.data.user.img);

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
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, login, logout, isAuthLoading, checkToken }}
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

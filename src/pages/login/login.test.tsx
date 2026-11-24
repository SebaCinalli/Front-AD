/**
 * Test unitario de componente React — Login
 * Verifica renderizado, validaciones de email/contraseña, toggle de visibilidad
 * y envío exitoso de credenciales contra /api/usuario/login.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { Login } from './login';
import { UserProvider } from '../../context/usercontext';
import { AlertProvider } from '../../context/alertcontext';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AlertProvider>
        <UserProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Menú Principal Mock</div>} />
          </Routes>
        </UserProvider>
      </AlertProvider>
    </MemoryRouter>,
  );

describe('Componente Login (Test Unitario)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los campos de usuario, contraseña y botón Ingresar', () => {
    renderLogin();

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ingresar' }),
    ).toBeInTheDocument();
  });

  it('muestra errores de validación y no llama a la API si los datos son inválidos', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Usuario'), 'correo-invalido');
    await user.type(screen.getByLabelText('Contraseña'), '123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.error-text').length).toBeGreaterThan(0);
  });

  it('alterna la visibilidad de la contraseña al presionar el botón del ojo', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' }),
    );
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('inicia sesión correctamente y redirige al menú principal', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 2,
        email: 'juan.perez@email.com',
        username: 'juanperez',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol: 'usuario',
        img: '',
      },
    });

    renderLogin();

    await user.type(screen.getByLabelText('Usuario'), 'juan.perez@email.com');
    await user.type(screen.getByLabelText('Contraseña'), 'Cliente123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/usuario/login'),
        { email: 'juan.perez@email.com', password: 'Cliente123' },
        { withCredentials: true },
      );
      expect(screen.getByText('Menú Principal Mock')).toBeInTheDocument();
    });
  });
});

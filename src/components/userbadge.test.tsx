/**
 * Test unitario de componente React — UserBadge
 * Verifica que muestre nombre/rol/carrito para un cliente y oculte el carrito para administradores.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserBadge } from './userbadge';

const mockUseUser = vi.fn();
const mockUseCart = vi.fn();

vi.mock('../context/usercontext', () => ({
  useUser: () => mockUseUser(),
}));

vi.mock('../context/cartcontext', () => ({
  useCart: () => mockUseCart(),
}));

vi.mock('../context/eventdatecontext', () => ({
  useEventDate: () => ({ setEventDate: vi.fn() }),
}));

describe('Componente UserBadge (Test Unitario)', () => {
  it('muestra nombre, rol y contador del carrito para un usuario cliente', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 2,
        nombre: 'Juan',
        apellido: 'Pérez',
        rol: 'usuario',
        img: '',
      },
      logout: vi.fn(),
    });
    mockUseCart.mockReturnValue({ getItemCount: () => 2 });

    render(
      <MemoryRouter>
        <UserBadge />
      </MemoryRouter>,
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('usuario')).toBeInTheDocument();
    expect(screen.getByTitle('Ver carrito')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('oculta el botón del carrito cuando el usuario tiene rol administrador', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 1,
        nombre: 'Admin',
        apellido: 'Sistema',
        rol: 'administrador',
        img: '',
      },
      logout: vi.fn(),
    });
    mockUseCart.mockReturnValue({ getItemCount: () => 0 });

    render(
      <MemoryRouter>
        <UserBadge />
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin Sistema')).toBeInTheDocument();
    expect(screen.queryByTitle('Ver carrito')).not.toBeInTheDocument();
  });

  it('no renderiza nada si no hay usuario autenticado', () => {
    mockUseUser.mockReturnValue({ user: null, logout: vi.fn() });
    mockUseCart.mockReturnValue({ getItemCount: () => 0 });

    const { container } = render(
      <MemoryRouter>
        <UserBadge />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});

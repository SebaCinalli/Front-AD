import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './salon.css';
import { UserBadge } from '../../components/userbadge';
import { BackToMenu } from '../../components/BackToMenu';
import { useCart } from '../../context/cartcontext';
import { useUser } from '../../context/usercontext';
import { useEventDate } from '../../context/eventdatecontext';
import { useNavigate } from 'react-router-dom';

interface Salon {
  id: number;
  nombre: string;
  capacidad: number;
  montoS: number;
  zona: {
    id: number;
    nombre: string;
  };
  foto: string;
}

interface FilterState {
  zona: string;
  capacidadMin: string;
  capacidadMax: string;
  precioMin: string;
  precioMax: string;
}

export function Salon() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [salonesFiltrados, setSalonesFiltrados] = useState<Salon[]>([]);
  const [filtros, setFiltros] = useState<FilterState>({
    zona: '',
    capacidadMin: '',
    capacidadMax: '',
    precioMin: '',
    precioMax: '',
  });
  const [zonas, setZonas] = useState<string[]>([]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const { addItem, isInCart, removeItem } = useCart();
  const { user } = useUser();
  const { eventDate } = useEventDate();
  const eventDateParam = useMemo(() => eventDate ?? '', [eventDate]);
  const fechaDMY = useMemo(() => {
    if (!eventDateParam) return '';
    const [y, m, d] = eventDateParam.split('-');
    return `${d}/${m}/${y}`;
  }, [eventDateParam]);
  const navigate = useNavigate();

  const handleAddToCart = (salon: Salon) => {
    const cartItem = {
      id: salon.id,
      type: 'salon' as const,
      name: salon.nombre,
      price: salon.montoS,
      image: salon.foto,
      details: {
        capacidad: salon.capacidad,
        zona: salon.zona.nombre,
      },
    };

    const added = addItem(cartItem);

    if (!added) return;

    // Despachar evento para animación: intentamos obtener la imagen del card
    try {
      const imgEl = document.querySelector(
        `.salon-card[key="${salon.id}"] img`
      ) as HTMLImageElement | null;
      // fallback: buscar imagen por alt
      const img =
        imgEl ||
        (document.querySelector(
          `img[alt="${salon.nombre}"]`
        ) as HTMLImageElement | null);
      const rect = img
        ? img.getBoundingClientRect()
        : { left: 0, top: 0, width: 40, height: 40 };
      const detail = {
        src: img?.src || '/placeholder-image.svg',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
      window.dispatchEvent(new CustomEvent('fly-to-cart', { detail }));
    } catch (e) {
      // ignore
    }
  };

  // Función helper para construir URLs de imagen
  const buildImageUrl = (fileName: string | undefined) => {
    if (!fileName) return '/placeholder-image.svg';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `${import.meta.env.VITE_API_URL}/uploads/salones/${fileName}`;
  };

  useEffect(() => {
    const fetchSalones = async () => {
      try {
        const url = fechaDMY
          ? `${
              import.meta.env.VITE_API_URL
            }/api/salon?fecha=${encodeURIComponent(fechaDMY)}`
          : `${import.meta.env.VITE_API_URL}/api/salon`;
        const response = await axios.get(url, {
          withCredentials: true,
        });
        const data = response.data.data;
        setSalones(data);
        setSalonesFiltrados(data);
      } catch (error) {
        console.error('Error al cargar salones:', error);
      }
    };

    const fetchZonas = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/zona`,
          {
            withCredentials: true,
          }
        );
        const data = response.data.data;

        // Extraer todas las zonas disponibles del sistema con validación
        const todasLasZonas = data
          .map((zona: any) => zona.nombre?.trim())
          .filter((nombre: string) => nombre && nombre.length > 0)
          .filter(
            (nombre: string, index: number, array: string[]) =>
              array.indexOf(nombre) === index
          ); // Eliminar duplicados

        setZonas(todasLasZonas);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };

    fetchSalones();
    fetchZonas();
  }, [fechaDMY]);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...salones];

    if (filtros.zona) {
      // Filtrado robusto que maneja comparación exacta y normalizada
      resultado = resultado.filter((salon) => {
        if (!salon.zona?.nombre) return false;

        // Primero intentamos comparación exacta
        if (salon.zona.nombre === filtros.zona) {
          return true;
        }

        // Como fallback, comparación normalizada (sin espacios y en minúsculas)
        const zonaSalon = salon.zona.nombre.trim().toLowerCase();
        const zonaBuscada = filtros.zona.trim().toLowerCase();
        return zonaSalon === zonaBuscada;
      });
    }

    if (filtros.capacidadMin) {
      resultado = resultado.filter(
        (salon) => salon.capacidad >= parseInt(filtros.capacidadMin)
      );
    }

    if (filtros.capacidadMax) {
      resultado = resultado.filter(
        (salon) => salon.capacidad <= parseInt(filtros.capacidadMax)
      );
    }

    if (filtros.precioMin) {
      resultado = resultado.filter(
        (salon) => salon.montoS >= parseInt(filtros.precioMin)
      );
    }

    if (filtros.precioMax) {
      resultado = resultado.filter(
        (salon) => salon.montoS <= parseInt(filtros.precioMax)
      );
    }

    setSalonesFiltrados(resultado);
  }, [filtros, salones]);

  const handleFiltroChange = (campo: keyof FilterState, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      zona: '',
      capacidadMin: '',
      capacidadMax: '',
      precioMin: '',
      precioMax: '',
    });
  };

  return (
    <div className="salon-container">
      <BackToMenu />
      <UserBadge />

      {!eventDate && (
        <div
          className="warning"
          style={{
            background: '#fde68a',
            color: '#92400e',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          Seleccioná una fecha en el menú principal para ver disponibilidad por
          fecha.
          <button style={{ marginLeft: 12 }} onClick={() => navigate('/')}>
            Ir al menú
          </button>
        </div>
      )}

      {/* Contenedor layout: filtros + resultados */}
      <div className="salon-layout">
        {/* Panel de filtros */}
        <div className={`filtros-panel ${filtrosAbiertos ? 'abierto' : ''}`}>
          <div className="filtros-header">
            <h3>Filtros</h3>
            <button
              className="filtros-toggle"
              onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              aria-label="Toggle filtros"
            >
              <span
                className={`filtros-arrow ${filtrosAbiertos ? 'rotated' : ''}`}
              >
                ▼
              </span>
            </button>
          </div>
          <div
            className={`filtros-content ${
              filtrosAbiertos ? 'visible' : 'hidden'
            }`}
          >
            <div className="filtros-grid">
              <div className="filtro-item">
                <label htmlFor="zona-filter">Zona:</label>
                <select
                  id="zona-filter"
                  value={filtros.zona}
                  onChange={(e) => handleFiltroChange('zona', e.target.value)}
                >
                  <option value="">Todas las zonas</option>
                  {zonas.map((zona) => (
                    <option key={zona} value={zona}>
                      {zona}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-item">
                <label htmlFor="capacidad-min">Capacidad mínima:</label>
                <input
                  type="number"
                  id="capacidad-min"
                  value={filtros.capacidadMin}
                  onChange={(e) =>
                    handleFiltroChange('capacidadMin', e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              <div className="filtro-item">
                <label htmlFor="capacidad-max">Capacidad máxima:</label>
                <input
                  type="number"
                  id="capacidad-max"
                  value={filtros.capacidadMax}
                  onChange={(e) =>
                    handleFiltroChange('capacidadMax', e.target.value)
                  }
                  placeholder="Sin límite"
                />
              </div>

              <div className="filtro-item">
                <label htmlFor="precio-min">Precio mínimo:</label>
                <input
                  type="number"
                  id="precio-min"
                  value={filtros.precioMin}
                  onChange={(e) =>
                    handleFiltroChange('precioMin', e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              <div className="filtro-item">
                <label htmlFor="precio-max">Precio máximo:</label>
                <input
                  type="number"
                  id="precio-max"
                  value={filtros.precioMax}
                  onChange={(e) =>
                    handleFiltroChange('precioMax', e.target.value)
                  }
                  placeholder="Sin límite"
                />
              </div>

              <div className="filtro-item">
                <button
                  onClick={limpiarFiltros}
                  className="limpiar-filtros-btn"
                >
                  Limpiar filtros
                </button>
              </div>
              {/* Resultados - se muestra después de los filtros */}
              <div className="resultados-count">
                {salonesFiltrados.length} resultado(s) encontrado(s)
                {eventDate && (
                  <div style={{ color: '#94a3b8' }}>
                    Fecha seleccionada: {fechaDMY}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="salones-grid">
          {salonesFiltrados.map((salon) => (
            <div className="salon-card" key={salon.id}>
              <div className="salon-img-container">
                <img
                  src={buildImageUrl(salon.foto)}
                  alt={salon.nombre}
                  className="salon-img"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.svg';
                  }}
                />
              </div>
              <div className="salon-info">
                <h3 className="salon-name">{salon.nombre}</h3>
                <p className="salon-capacidad">
                  Capacidad: {salon.capacidad} personas
                </p>
                <p className="salon-montoS">
                  ${salon.montoS.toLocaleString('es-AR')}
                </p>
                <p className="salon-zona">{salon.zona.nombre}</p>
              </div>

              {/* Botón Agregar al carrito - solo para clientes */}
              {user?.rol !== 'administrador' && (
                <div className="salon-actions">
                  {isInCart(salon.id, 'salon') ? (
                    <div className="in-cart-actions">
                      <button className={`add-to-cart-btn added`} disabled>
                        <span>✓</span> Agregado
                      </button>
                      <button
                        className="remove-from-cart-btn"
                        onClick={() => removeItem(salon.id, 'salon')}
                        aria-label={`Eliminar ${salon.nombre} del carrito`}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`add-to-cart-btn ${
                        isInCart(salon.id, 'salon') ? 'added' : ''
                      }`}
                      onClick={() => handleAddToCart(salon)}
                      disabled={isInCart(salon.id, 'salon')}
                    >
                      <>
                        <span>🛒</span> Agregar
                      </>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cartcontext';
import { useUser } from '../../context/usercontext';
import { useAlert } from '../../context/alertcontext';
import { UserBadge } from '../../components/userbadge';
import './resultado.css';

export const Resultado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useUser();
  const { showAlert } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);

  const status = searchParams.get('status');
  const merchantOrderId = searchParams.get('merchant_order_id');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // Procesar el resultado del pago
    handlePaymentResult();
  }, [status, merchantOrderId]);

  const handlePaymentResult = async () => {
    if (!status) return;

    setIsProcessing(true);

    try {
      switch (status) {
        case 'success':
          showAlert('¡Pago realizado exitosamente!', 'success');
          // Limpiar el carrito tras pago exitoso
          clearCart();
          break;

        case 'failure':
          showAlert(
            'El pago fue rechazado. Por favor, intenta nuevamente.',
            'error',
          );
          break;

        case 'pending':
          showAlert(
            'El pago está pendiente de aprobación. Te notificaremos cuando se haya completado.',
            'warning',
          );
          break;

        default:
          showAlert('Estado de pago desconocido.', 'warning');
      }
    } catch (error: any) {
      console.error('Error procesando resultado del pago:', error);
      showAlert('Error al procesar el resultado del pago', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Pago Exitoso';
      case 'failure':
        return 'Pago Rechazado';
      case 'pending':
        return 'Pago Pendiente';
      default:
        return 'Estado Desconocido';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Tu pago ha sido procesado exitosamente. Tu solicitud se ha registrado en nuestro sistema.';
      case 'failure':
        return 'Lamentablemente, tu pago fue rechazado. Por favor, verifica tu información y vuelve a intentarlo.';
      case 'pending':
        return 'Tu pago está siendo procesado. Te enviaremos una notificación cuando se haya completado.';
      default:
        return 'No pudimos determinar el estado de tu pago.';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'success':
        return 'success-text';
      case 'failure':
        return 'failure-text';
      case 'pending':
        return 'pending-text';
      default:
        return 'unknown-text';
    }
  };

  return (
    <div className="resultado-container">
      <UserBadge />

      <div className="resultado-content">
        <div className="resultado-card">
          <div className={`resultado-icon ${getStatusTextColor()}`}>
            {getStatusIcon()}
          </div>

          <h1 className={`resultado-title ${getStatusTextColor()}`}>
            {getStatusTitle()}
          </h1>

          <p className="resultado-description">{getStatusDescription()}</p>

          {preferenceId && (
            <div className="resultado-info">
              <p className="info-label">ID de Preferencia:</p>
              <p className="info-value">{preferenceId}</p>
            </div>
          )}

          {merchantOrderId && (
            <div className="resultado-info">
              <p className="info-label">Orden de Compra:</p>
              <p className="info-value">{merchantOrderId}</p>
            </div>
          )}

          <div className="resultado-info">
            <p className="info-label">Usuario:</p>
            <p className="info-value">
              {user?.nombre} {user?.apellido}
            </p>
          </div>

          <div className="resultado-actions">
            {status === 'success' && (
              <>
                <button
                  className="resultado-btn primary"
                  onClick={() => navigate('/solicitud')}
                >
                  Ver Mis Solicitudes
                </button>
                <button
                  className="resultado-btn secondary"
                  onClick={() => navigate('/')}
                >
                  Volver al Menú
                </button>
              </>
            )}

            {status === 'failure' && (
              <>
                <button
                  className="resultado-btn primary"
                  onClick={() => navigate('/carrito')}
                >
                  Volver al Carrito
                </button>
                <button
                  className="resultado-btn secondary"
                  onClick={() => navigate('/')}
                >
                  Ir al Menú Principal
                </button>
              </>
            )}

            {status === 'pending' && (
              <>
                <button
                  className="resultado-btn primary"
                  onClick={() => navigate('/solicitud')}
                >
                  Ver Estado de Solicitudes
                </button>
                <button
                  className="resultado-btn secondary"
                  onClick={() => navigate('/')}
                >
                  Volver al Menú
                </button>
              </>
            )}

            {!status && (
              <button
                className="resultado-btn primary"
                onClick={() => navigate('/')}
              >
                Ir al Menú Principal
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="resultado-loading">
              <span className="spinner"></span>
              <p>Procesando tu pago...</p>
            </div>
          )}
        </div>

        <div className="resultado-help">
          <h3>¿Necesitas ayuda?</h3>
          <p>
            Si tienes problemas con tu pago, contáctanos a través del correo de
            soporte o comunícate directamente con nuestro equipo.
          </p>
          <p>
            <strong>Email de soporte:</strong> soporte@eventoapp.com
          </p>
        </div>
      </div>
    </div>
  );
};

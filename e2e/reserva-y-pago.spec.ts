/**
 * Test End-to-End (Playwright)
 * Recorre el flujo completo de un cliente en navegador real:
 * Login -> Selección de fecha -> Catálogo de Salones -> Carrito ->
 * Creación de Solicitud + Pago -> Retorno /resultado -> Estado "pagado" en Mis Solicitudes.
 */
import { test, expect } from '@playwright/test';

test('flujo E2E completo: login, reserva de salón, pago y confirmación de estado pagado', async ({
  page,
}) => {
  let isLoggedIn = false;
  let solicitudEstado = 'pendiente de pago';
  let createPaymentPayload: any = null;
  let confirmPayload: any = null;

  const mockUser = {
    id: 2,
    email: 'juan.perez@email.com',
    username: 'juanperez',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'usuario',
    img: '',
  };

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (url.includes('/api/usuario/verify')) {
      if (!isLoggedIn) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'No autenticado' }) });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token válido', user: mockUser }),
      });
    }

    if (url.includes('/api/usuario/login') && method === 'POST') {
      isLoggedIn = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Usuario found', ...mockUser }),
      });
    }

    if (url.includes('/api/zona') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ id: 1, nombre: 'Centro' }] }),
      });
    }

    if (url.includes('/api/salon') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 10,
              nombre: 'Salón Imperial',
              capacidad: 150,
              montoS: 120000,
              zona: { id: 1, nombre: 'Centro' },
              foto: '',
            },
          ],
        }),
      });
    }

    if (url.includes('/api/solicitud') && method === 'POST') {
      solicitudEstado = 'pendiente de pago';
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'solicitud creada',
          data: { id: 42, estado: solicitudEstado, montoTotal: 120000 },
        }),
      });
    }

    if (url.includes('/api/payment/create-payment') && method === 'POST') {
      createPaymentPayload = req.postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ init_point: 'about:blank' }),
      });
    }

    if (url.includes('/api/payment/confirm') && method === 'POST') {
      confirmPayload = req.postDataJSON();
      solicitudEstado = 'pagado';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          confirmed: true,
          paymentStatus: 'approved',
          solicitudId: 42,
          result: 'updated',
        }),
      });
    }

    if (url.includes('/api/solicitud') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 42,
              usuario: mockUser,
              salon: { id: 10, nombre: 'Salón Imperial' },
              estado: solicitudEstado,
              fechaSolicitud: '2026-11-23T00:00:00.000Z',
              fechaEvento: '2026-12-25T00:00:00.000Z',
              montoSalon: 120000,
              montoTotal: 120000,
            },
          ],
        }),
      });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // 1) Login
  await page.goto('/login');
  await page.getByLabel('Usuario', { exact: true }).fill('juan.perez@email.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('Cliente123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByText('Menú Principal')).toBeVisible();
  await expect(page.getByText('Juan Pérez')).toBeVisible();

  // 2) Seleccionar fecha futura del evento en el DatePicker
  const dateInput = page.locator('#event-date');
  await dateInput.click();
  await dateInput.fill('25/12/2026');
  await dateInput.press('Enter');

  // 3) Entrar a Salones y agregar "Salón Imperial" al carrito
  await page.getByText('Reservar Salón').locator('..').click();
  await expect(page.getByText('Salón Imperial')).toBeVisible();
  await page.getByRole('button', { name: /Agregar/i }).click();
  await expect(page.getByRole('button', { name: /Agregado/i })).toBeVisible();

  // 4) Ir al Carrito y proceder al pago
  await page.getByTitle('Ver carrito').click();
  await expect(page.getByText('Mi Carrito de Compras')).toBeVisible();
  await expect(page.getByText('Salón Imperial')).toBeVisible();

  // Evitamos que window.open abra una pestaña real durante el test
  await page.evaluate(() => {
    window.open = () => null;
  });

  await page.getByRole('button', { name: /Proceder al Pago/i }).click();

  await expect.poll(() => createPaymentPayload).not.toBeNull();
  expect(createPaymentPayload.solicitudId).toBe(42);
  expect(createPaymentPayload.items).toHaveLength(1);

  // 5) Simular retorno desde Mercado Pago a /resultado
  await page.goto(
    '/resultado?result=success&solicitudId=42&payment_id=999888777&status=approved',
  );

  await expect(page.getByText('Pago Exitoso')).toBeVisible();
  await expect(page.getByText('¡Pago realizado exitosamente!')).toBeVisible();
  await expect.poll(() => confirmPayload).toMatchObject({
    paymentId: '999888777',
    solicitudId: 42,
  });

  // Cerrar modal de alerta de éxito
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // 6) Navegar a Mis Solicitudes y verificar estado "pagado"
  await page.getByRole('button', { name: 'Ver Mis Solicitudes' }).click();
  await expect(page.getByText('Solicitud #42')).toBeVisible();
  await expect(page.locator('.estado-badge')).toHaveText('pagado');
});

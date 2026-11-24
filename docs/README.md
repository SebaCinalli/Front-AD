# Documentación — Front-AD (TP-DSW)

Este directorio corresponde a la documentación del repositorio frontend **[Front-AD](https://github.com/SebaCinalli/Front-AD)** del **Sistema de Gestión y Reserva de Eventos**.

La documentación completa y unificada del proyecto (Proposal, Minutas, Tracking, API, Deploy, Demo y Evidencia de Tests) está centralizada en el directorio `docs/` de **[Back-AD](https://github.com/SebaCinalli/Back-AD/tree/main/docs)**:

- [Índice General de Documentación](https://github.com/SebaCinalli/Back-AD/blob/main/docs/README.md)
- [Proposal Actualizada](https://github.com/SebaCinalli/Back-AD/blob/main/docs/proposal.md)
- [Links a Pull Requests (Back-AD y Front-AD)](https://github.com/SebaCinalli/Back-AD/blob/main/docs/prs.md)
- [Instrucciones de Instalación](https://github.com/SebaCinalli/Back-AD/blob/main/docs/instalacion.md)
- [Minutas de Reunión y Avance](https://github.com/SebaCinalli/Back-AD/blob/main/docs/minutas.md)
- [Tracking de Features, Bugs e Issues](https://github.com/SebaCinalli/Back-AD/blob/main/docs/tracking.md)
- [Documentación de la API](https://github.com/SebaCinalli/Back-AD/blob/main/docs/api.md)
- [Evidencia de Tests Automáticos](https://github.com/SebaCinalli/Back-AD/blob/main/docs/testing.md)
- [Demo en Video](https://github.com/SebaCinalli/Back-AD/blob/main/docs/demo.md)
- [Deploy en Render y Mercado Pago](https://github.com/SebaCinalli/Back-AD/blob/main/docs/deploy.md)

## Resumen Técnico de `Front-AD`

- **Stack:** React 19 + TypeScript 5.8 + Vite 7 + React Router v7 + Axios.
- **Producción:** https://front-ad-2.onrender.com
- **Contextos globales:** `UserContext` (sesión JWT vía `/api/usuario/verify`), `CartContext` (`localStorage`, máx. 1 servicio por categoría), `EventDateContext`, `AlertContext` y `ConfirmContext`.
- **Tests automatizados:**
  - Unitarios de componentes (`pnpm test`): `src/pages/login/login.test.tsx` (4 casos) y `src/components/userbadge.test.tsx` (3 casos) — Vitest + React Testing Library + `happy-dom`.
  - End-to-End (`pnpm run test:e2e`): `e2e/reserva-y-pago.spec.ts` — Playwright en Chrome real recorriendo Login → Fecha → Salón → Carrito → Pago → `/resultado` → estado `pagado`.

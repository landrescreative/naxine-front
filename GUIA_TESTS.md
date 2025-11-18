# 🧪 Guía de Tests - Naxine Frontend

## 📋 Índice

1. [Cómo ejecutar los tests](#cómo-ejecutar-los-tests)
2. [Estructura de los tests](#estructura-de-los-tests)
3. [Cómo funcionan los tests actuales](#cómo-funcionan-los-tests-actuales)
4. [Cómo escribir nuevos tests](#cómo-escribir-nuevos-tests)
5. [Interpretar resultados](#interpretar-resultados)
6. [Mejores prácticas](#mejores-prácticas)

---

## 🚀 Cómo ejecutar los tests

### Instalar dependencias (si aún no lo has hecho)

```bash
npm install
```

**⚠️ Nota sobre compatibilidad con React 19:**

Si encuentras un error de dependencias como:

```
Could not resolve dependency:
peer react@"^18.0.0" from @testing-library/react@14.3.1
```

Esto se debe a que React 19 requiere `@testing-library/react@16.0.0` o superior. El `package.json` ya está configurado con la versión correcta. Si el error persiste, puedes usar:

```bash
npm install --legacy-peer-deps
```

Esto instalará las dependencias ignorando los conflictos de peer dependencies (generalmente seguro para testing).

### Comandos disponibles

```bash
# Ejecutar todos los tests una vez
npm test

# Ejecutar tests en modo watch (se re-ejecutan al guardar cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

### Ejecutar un test específico

```bash
# Ejecutar solo un archivo de test
npm test useAuth.test.ts

# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="login"
```

---

## 📁 Estructura de los tests

### Ubicación de los tests

Los tests se organizan siguiendo esta estructura:

```
src/
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/          ← Tests del hook
│       └── useAuth.test.ts
├── components/
│   └── dashboard/
│       └── __tests__/      ← Tests de componentes (futuro)
│           └── ...
└── services/
    └── api/
        └── __tests__/      ← Tests de servicios (futuro)
            └── ...
```

### Convención de nombres

- Los archivos de test deben terminar en `.test.ts` o `.test.tsx`
- O pueden terminar en `.spec.ts` o `.spec.tsx`
- Se colocan en una carpeta `__tests__` junto al archivo que prueban

---

## 🔍 Cómo funcionan los tests actuales

### Test de useAuth (`src/hooks/__tests__/useAuth.test.ts`)

Este test verifica el comportamiento del hook `useAuth`, que maneja la autenticación.

#### 1. **Setup y Mocks**

```typescript
// Mock de servicios externos
jest.mock("@/services/api/auth");
jest.mock("@/lib/cookies");
jest.mock("@/lib/logger");

// Esto reemplaza las implementaciones reales con versiones "falsas"
// que podemos controlar en los tests
```

**¿Por qué hacer mocks?**

- Aislamos el código que queremos probar
- Evitamos llamadas reales a APIs
- Controlamos las respuestas para probar diferentes escenarios

#### 2. **beforeEach - Limpieza entre tests**

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Limpia todos los mocks
  localStorage.clear(); // Limpia localStorage
  mockCookies.getCookie.mockReturnValue(undefined); // Resetea cookies
});
```

**¿Por qué?**

- Cada test debe empezar en un estado limpio
- Evita que un test afecte a otro

#### 3. **Tests de Estado Inicial**

```typescript
it("debe inicializar con usuario null y loading true", () => {
  const { result } = renderHook(() => useAuth());

  expect(result.current.user).toBeNull();
  expect(result.current.loading).toBe(true);
  expect(result.current.isAuthenticated).toBe(false);
});
```

**¿Qué hace?**

- `renderHook`: Renderiza el hook en un entorno de test
- `result.current`: Accede al valor actual retornado por el hook
- `expect(...).toBeNull()`: Verifica que el valor sea `null`

#### 4. **Tests de Login Exitoso**

```typescript
it('debe hacer login exitosamente', async () => {
  // 1. Configurar el mock para que retorne éxito
  mockAuthService.login.mockResolvedValue({
    success: true,
    data: { token: 'mock-token', usuario: {...} }
  })

  // 2. Renderizar el hook
  const { result } = renderHook(() => useAuth())

  // 3. Ejecutar la función de login
  await act(async () => {
    const loginResult = await result.current.login({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(loginResult).toBe(true)
  })

  // 4. Verificar que el estado cambió correctamente
  await waitFor(() => {
    expect(result.current.user).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })

  // 5. Verificar que se llamó a setCookie
  expect(mockCookies.setCookie).toHaveBeenCalledWith(
    'auth-token',
    'mock-token',
    expect.any(Object)
  )
})
```

**Explicación paso a paso:**

1. **Mock de respuesta**: Configuramos qué debe retornar el servicio de autenticación
2. **act()**: Envuelve actualizaciones de estado para que React las procese correctamente
3. **waitFor()**: Espera a que se cumpla una condición (útil para estados asíncronos)
4. **expect().toHaveBeenCalledWith()**: Verifica que una función fue llamada con argumentos específicos

#### 5. **Tests de Manejo de Errores**

```typescript
it("debe manejar errores de login", async () => {
  // Configurar el mock para que retorne error
  mockAuthService.login.mockResolvedValue({
    success: false,
    error: "Credenciales inválidas",
  });

  const { result } = renderHook(() => useAuth());

  await act(async () => {
    const loginResult = await result.current.login({
      email: "test@example.com",
      password: "wrong-password",
    });
    expect(loginResult).toBe(false);
  });

  // Verificar que NO se autenticó
  await waitFor(() => {
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## ✍️ Cómo escribir nuevos tests

### Ejemplo: Test de un componente

```typescript
// src/components/dashboard/__tests__/ProfessionalSidebar.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ProfessionalSidebar from "../ProfessionalSidebar";

describe("ProfessionalSidebar", () => {
  it("debe renderizar todos los items del menú", () => {
    const mockOnItemClick = jest.fn();

    render(
      <ProfessionalSidebar activeItem="inicio" onItemClick={mockOnItemClick} />
    );

    // Verificar que los items están presentes
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Citas")).toBeInTheDocument();
    expect(screen.getByText("Pagos")).toBeInTheDocument();
  });

  it("debe llamar onItemClick cuando se hace clic en un item", () => {
    const mockOnItemClick = jest.fn();

    render(
      <ProfessionalSidebar activeItem="inicio" onItemClick={mockOnItemClick} />
    );

    // Simular clic en "Citas"
    fireEvent.click(screen.getByText("Citas"));

    // Verificar que se llamó la función con el argumento correcto
    expect(mockOnItemClick).toHaveBeenCalledWith("citas");
  });
});
```

### Ejemplo: Test de un servicio

```typescript
// src/services/api/__tests__/appointments.test.ts
import { appointmentsService } from "../appointments";
import { apiClient } from "../client";

jest.mock("../client");

describe("AppointmentsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe obtener citas correctamente", async () => {
    const mockAppointments = [
      { id: "1", fecha: "2024-01-01", profesional: "Dr. Smith" },
    ];

    // Mock de la respuesta del API client
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: { citas: mockAppointments },
    });

    const result = await appointmentsService.getAppointments();

    expect(result.success).toBe(true);
    expect(result.data?.citas).toEqual(mockAppointments);
    expect(apiClient.get).toHaveBeenCalledWith("/citas", expect.any(Object));
  });
});
```

---

## 📊 Interpretar resultados

### Ejecución exitosa

```
PASS  src/hooks/__tests__/useAuth.test.ts
  useAuth
    Estado inicial
      ✓ debe inicializar con usuario null y loading true (15ms)
    Login
      ✓ debe hacer login exitosamente (45ms)
      ✓ debe manejar errores de login (32ms)
    Logout
      ✓ debe hacer logout correctamente (28ms)
    Registro
      ✓ debe registrar un nuevo usuario exitosamente (38ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Time:        2.345 s
```

### Test fallido

```
FAIL  src/hooks/__tests__/useAuth.test.ts
  useAuth
    Login
      ✕ debe hacer login exitosamente (125ms)

  ● useAuth › Login › debe hacer login exitosamente

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      45 |     await act(async () => {
      46 |       const loginResult = await result.current.login({
    > 47 |         expect(loginResult).toBe(true)
         |                            ^
      48 |       })
      49 |     })
```

**Cómo leerlo:**

- `FAIL`: El test falló
- `Expected: true`: Esperábamos `true`
- `Received: false`: Pero recibimos `false`
- La línea `> 47` muestra dónde falló

### Reporte de cobertura

```bash
npm run test:coverage
```

```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   65.23 |    52.10 |   58.33 |   64.89 |
 useAuth.ts         |   78.50 |    65.00 |   75.00 |   78.00 |
```

**Explicación:**

- **% Stmts**: Porcentaje de declaraciones ejecutadas
- **% Branch**: Porcentaje de ramas (if/else) ejecutadas
- **% Funcs**: Porcentaje de funciones ejecutadas
- **% Lines**: Porcentaje de líneas ejecutadas

---

## ✅ Mejores prácticas

### 1. **Nombres descriptivos**

```typescript
// ❌ Mal
it('test login', () => { ... })

// ✅ Bien
it('debe hacer login exitosamente cuando las credenciales son válidas', () => { ... })
```

### 2. **Un test, una cosa**

```typescript
// ❌ Mal - prueba múltiples cosas
it('debe hacer login y logout', () => { ... })

// ✅ Bien - un test por funcionalidad
it('debe hacer login exitosamente', () => { ... })
it('debe hacer logout correctamente', () => { ... })
```

### 3. **Arrange-Act-Assert (AAA)**

```typescript
it('debe hacer login exitosamente', async () => {
  // Arrange: Preparar el test
  mockAuthService.login.mockResolvedValue({ success: true, data: {...} })
  const { result } = renderHook(() => useAuth())

  // Act: Ejecutar la acción
  await act(async () => {
    await result.current.login({ email: 'test@example.com', password: '123' })
  })

  // Assert: Verificar el resultado
  expect(result.current.isAuthenticated).toBe(true)
})
```

### 4. **Limpiar después de cada test**

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

### 5. **Usar mocks apropiados**

```typescript
// ✅ Mock de servicios externos
jest.mock("@/services/api/auth");

// ✅ Mock de funciones del navegador
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

---

## 🎯 Comandos útiles

```bash
# Ejecutar tests en modo watch (recomendado durante desarrollo)
npm run test:watch

# Ejecutar solo tests que fallaron la última vez
npm test -- --onlyFailures

# Ejecutar tests con más información
npm test -- --verbose

# Ejecutar tests y actualizar snapshots
npm test -- -u

# Ejecutar tests con límite de tiempo personalizado
npm test -- --testTimeout=10000
```

---

## 📚 Recursos adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última actualización:** 2025-01-XX

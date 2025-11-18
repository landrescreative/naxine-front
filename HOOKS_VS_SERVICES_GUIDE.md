# Guía de Consumo de Datos: Hooks vs Servicios Directos

## ¿Cuándo usar cada enfoque?

### 🎯 **Hooks Personalizados (Recomendado)**

**Usa hooks cuando:**

- Necesitas **reutilizar** la lógica de carga de datos en múltiples componentes
- Quieres **manejo consistente** de estados (loading, error, data)
- Necesitas **funcionalidades avanzadas** como refetch, paginación, búsqueda
- Trabajas con **datos complejos** que requieren transformaciones

**Ejemplo:**

```typescript
// ✅ Recomendado para componentes complejos
import { useAppointments } from "@/hooks";

const MyComponent = () => {
  const {
    appointments,
    loading,
    error,
    createAppointment,
    cancelAppointment,
    refetch,
  } = useAppointments({ page: 1, limit: 10 });

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};
```

### 🔧 **Servicios Directos**

**Usa servicios directos cuando:**

- Necesitas **una sola llamada** a la API
- Es una **acción específica** (crear, actualizar, eliminar)
- No necesitas **estados complejos** de loading/error
- Es un **caso de uso único** que no se reutilizará

**Ejemplo:**

```typescript
// ✅ Recomendado para acciones simples
import { appointmentsService } from "@/services";

const CreateAppointmentButton = () => {
  const handleCreate = async () => {
    try {
      const result = await appointmentsService.createAppointment(data);
      if (result.success) {
        alert("Cita creada");
      }
    } catch (error) {
      alert("Error al crear cita");
    }
  };

  return <button onClick={handleCreate}>Crear Cita</button>;
};
```

## Comparación de Enfoques

| Aspecto               | Hooks Personalizados | Servicios Directos |
| --------------------- | -------------------- | ------------------ |
| **Reutilización**     | ✅ Alta              | ❌ Baja            |
| **Manejo de Estados** | ✅ Automático        | ❌ Manual          |
| **Complejidad**       | ⚠️ Media             | ✅ Baja            |
| **Rendimiento**       | ✅ Optimizado        | ⚠️ Básico          |
| **Testing**           | ✅ Fácil             | ⚠️ Medio           |
| **Mantenimiento**     | ✅ Centralizado      | ❌ Disperso        |

## Hooks Disponibles

### 1. **useAppointments**

```typescript
const {
  appointments, // Lista de citas
  stats, // Estadísticas
  loading, // Estado de carga
  error, // Errores
  createAppointment, // Crear cita
  cancelAppointment, // Cancelar cita
  updateAppointment, // Actualizar cita
  refetch, // Recargar datos
} = useAppointments({
  page: 1,
  limit: 10,
  status: "confirmed",
  professionalId: "prof-001",
});
```

### 2. **useProfessionals**

```typescript
const {
  professionals, // Lista de profesionales
  stats, // Estadísticas
  loading, // Estado de carga
  error, // Errores
  searchProfessionals, // Buscar profesionales
  getProfessionalsBySpecialty, // Filtrar por especialidad
  getProfessionalAvailability, // Obtener disponibilidad
} = useProfessionals({
  page: 1,
  limit: 10,
  specialty: "Psicología",
  search: "psicólogo",
});
```

### 3. **useCategories**

```typescript
const {
  categories, // Lista de categorías
  selectedCategory, // Categoría seleccionada
  loading, // Estado de carga
  error, // Errores
  searchCategories, // Buscar categorías
  getCategoryById, // Obtener categoría por ID
  getServicesByCategory, // Obtener servicios de categoría
} = useCategories({
  page: 1,
  limit: 10,
  search: "terapia",
});
```

### 4. **useUsers**

```typescript
const {
  users, // Lista de usuarios
  stats, // Estadísticas
  loading, // Estado de carga
  error, // Errores
  searchUsers, // Buscar usuarios
  getUserById, // Obtener usuario por ID
  updateUser, // Actualizar usuario
  deactivateUser, // Desactivar usuario
  activateUser, // Activar usuario
} = useUsers({
  page: 1,
  limit: 10,
  search: "john",
  status: "Activo",
});
```

## Patrones de Uso Recomendados

### **1. Dashboard Completo**

```typescript
// ✅ Usar hooks para dashboards complejos
const Dashboard = () => {
  const { appointments, loading: apptsLoading } = useAppointments();
  const { professionals, loading: profsLoading } = useProfessionals();
  const { categories, loading: catsLoading } = useCategories();

  const loading = apptsLoading || profsLoading || catsLoading;

  return (
    <div>
      {loading && <LoadingSpinner />}
      <AppointmentsList appointments={appointments} />
      <ProfessionalsList professionals={professionals} />
      <CategoriesList categories={categories} />
    </div>
  );
};
```

### **2. Formulario Simple**

```typescript
// ✅ Usar servicios directos para formularios
const CreateAppointmentForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await appointmentsService.createAppointment(data);
      if (result.success) {
        router.push("/appointments");
      }
    } catch (error) {
      alert("Error al crear cita");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### **3. Lista con Búsqueda**

```typescript
// ✅ Usar hooks para listas con funcionalidades avanzadas
const ProfessionalsList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { professionals, loading, error, searchProfessionals } =
    useProfessionals({ search: searchQuery });

  // La búsqueda se ejecuta automáticamente cuando cambia searchQuery
  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar profesionales..."
      />
      {loading && <Spinner />}
      {professionals.map((prof) => (
        <ProfessionalCard key={prof.id} professional={prof} />
      ))}
    </div>
  );
};
```

### **4. Acción Rápida**

```typescript
// ✅ Usar servicios directos para acciones rápidas
const QuickActions = () => {
  const handleQuickCancel = async (appointmentId) => {
    const result = await appointmentsService.cancelAppointment(appointmentId);
    if (result.success) {
      toast.success("Cita cancelada");
    }
  };

  return (
    <button onClick={() => handleQuickCancel(appointmentId)}>
      Cancelar Cita
    </button>
  );
};
```

## Migración Gradual

### **Paso 1: Identificar Componentes**

```typescript
// Antes: Servicio directo
const OldComponent = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const response = await appointmentsService.getAppointments();
      setAppointments(response.data?.data || []);
      setLoading(false);
    };
    loadData();
  }, []);

  return <div>...</div>;
};
```

### **Paso 2: Migrar a Hook**

```typescript
// Después: Hook personalizado
const NewComponent = () => {
  const { appointments, loading } = useAppointments();

  return <div>...</div>;
};
```

## Recomendaciones Finales

1. **Empieza con hooks** para componentes nuevos
2. **Migra gradualmente** los componentes existentes
3. **Usa servicios directos** solo para acciones simples
4. **Combina ambos enfoques** según la necesidad
5. **Mantén consistencia** en tu proyecto

Los hooks personalizados te darán una base sólida y escalable para tu aplicación, mientras que los servicios directos son perfectos para casos específicos y simples.

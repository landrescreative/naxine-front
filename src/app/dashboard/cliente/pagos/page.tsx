import AppointmentHistoryTable from "@/components/dashboard/AppointmentHistoryTable";

export default function PagosPage() {
  // Sample data for appointment history
  const appointmentHistory = [
    {
      id: "1",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "2",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "3",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "4",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "5",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "6",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "7",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "8",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "9",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "10",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "11",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
    {
      id: "12",
      order: {
        specialty: "Nutriologa",
        professional: "Carmen Leandra",
      },
      date: "Dic 23, 2024",
      amount: "USD $12.00",
      type: "Primera consulta",
      status: "confirmed" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Appointment History Table */}
      <AppointmentHistoryTable appointments={appointmentHistory} />
    </div>
  );
}

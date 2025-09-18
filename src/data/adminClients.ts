export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerNumber: string;
  incomeUsd: number;
  status: "Activo" | "Inactivo";
  // Additional fields for edit form
  fullName: string;
  username: string;
  city: string;
  postalCode: string;
  createdAt: string;
  lastLogin: string;
  totalSessions: number;
  totalSpent: number;
}

export const ADMIN_CLIENTS: AdminClient[] = [
  {
    id: "1",
    name: "John Bushnill",
    fullName: "John Bushnill",
    email: "johnb@mail.com",
    phone: "078 5054 8877",
    customerNumber: "00000001",
    incomeUsd: 121,
    status: "Inactivo",
    username: "johnbush",
    city: "Madrid",
    postalCode: "28001",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
    totalSessions: 3,
    totalSpent: 363,
  },
  {
    id: "2",
    name: "Laura Prichet",
    fullName: "Laura Prichet",
    email: "laura_prichet@mail.com",
    phone: "215 302 3376",
    customerNumber: "00000002",
    incomeUsd: 590,
    status: "Activo",
    username: "laurapr",
    city: "Barcelona",
    postalCode: "08001",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-25",
    totalSessions: 8,
    totalSpent: 4720,
  },
  {
    id: "3",
    name: "Mohammad Karim",
    fullName: "Mohammad Karim",
    email: "m_karim@mail.com",
    phone: "050 414 8778",
    customerNumber: "00000003",
    incomeUsd: 125,
    status: "Inactivo",
    username: "mkarim",
    city: "Valencia",
    postalCode: "46001",
    createdAt: "2024-01-12",
    lastLogin: "2024-01-18",
    totalSessions: 2,
    totalSpent: 250,
  },
  {
    id: "4",
    name: "Josh Bill",
    fullName: "Josh Bill",
    email: "josh_bill@mail.com",
    phone: "216 75 612 706",
    customerNumber: "00000004",
    incomeUsd: 348,
    status: "Inactivo",
    username: "joshbill",
    city: "Sevilla",
    postalCode: "41001",
    createdAt: "2024-01-08",
    lastLogin: "2024-01-16",
    totalSessions: 5,
    totalSpent: 1740,
  },
  {
    id: "5",
    name: "Josh Adam",
    fullName: "Josh Adam",
    email: "josh_adam@mail.com",
    phone: "02 75 150 655",
    customerNumber: "00000005",
    incomeUsd: 607,
    status: "Activo",
    username: "joshadam",
    city: "Bilbao",
    postalCode: "48001",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-26",
    totalSessions: 12,
    totalSpent: 7284,
  },
  {
    id: "6",
    name: "Sin Tae",
    fullName: "Sin Tae",
    email: "sin_tae@mail.com",
    phone: "078 6013 3854",
    customerNumber: "00000006",
    incomeUsd: 234,
    status: "Activo",
    username: "sintae",
    city: "Málaga",
    postalCode: "29001",
    createdAt: "2024-01-14",
    lastLogin: "2024-01-24",
    totalSessions: 6,
    totalSpent: 1404,
  },
  {
    id: "7",
    name: "Rajesh Masvidal",
    fullName: "Rajesh Masvidal",
    email: "rajesh_m@mail.com",
    phone: "828 216 2190",
    customerNumber: "00000007",
    incomeUsd: 760,
    status: "Inactivo",
    username: "rajesh",
    city: "Zaragoza",
    postalCode: "50001",
    createdAt: "2024-01-11",
    lastLogin: "2024-01-19",
    totalSessions: 4,
    totalSpent: 3040,
  },
  {
    id: "8",
    name: "Fajar Surya",
    fullName: "Fajar Surya",
    email: "fsurya@mail.com",
    phone: "078 7173 9261",
    customerNumber: "00000008",
    incomeUsd: 400,
    status: "Activo",
    username: "fajars",
    city: "Murcia",
    postalCode: "30001",
    createdAt: "2024-01-13",
    lastLogin: "2024-01-25",
    totalSessions: 7,
    totalSpent: 2800,
  },
  {
    id: "9",
    name: "Lisa Greg",
    fullName: "Lisa Greg",
    email: "lisag@mail.com",
    phone: "077 6157 2428",
    customerNumber: "00000009",
    incomeUsd: 812,
    status: "Activo",
    username: "lisagreg",
    city: "Palma",
    postalCode: "07001",
    createdAt: "2024-01-09",
    lastLogin: "2024-01-26",
    totalSessions: 10,
    totalSpent: 8120,
  },
  {
    id: "10",
    name: "Linda Blair",
    fullName: "Linda Blair",
    email: "lindablair@mail.com",
    phone: "050 414 8778",
    customerNumber: "00000010",
    incomeUsd: 723,
    status: "Activo",
    username: "lindab",
    city: "Las Palmas",
    postalCode: "35001",
    createdAt: "2024-01-07",
    lastLogin: "2024-01-25",
    totalSessions: 9,
    totalSpent: 6507,
  },
];

// Helper function to get client by ID
export const getClientById = (id: string): AdminClient | undefined => {
  return ADMIN_CLIENTS.find((client) => client.id === id);
};

// Helper function to update client
export const updateClient = (
  id: string,
  updates: Partial<AdminClient>
): AdminClient | undefined => {
  const clientIndex = ADMIN_CLIENTS.findIndex((client) => client.id === id);
  if (clientIndex !== -1) {
    ADMIN_CLIENTS[clientIndex] = { ...ADMIN_CLIENTS[clientIndex], ...updates };
    return ADMIN_CLIENTS[clientIndex];
  }
  return undefined;
};

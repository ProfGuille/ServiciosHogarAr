import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartProps {
  data: any[];
  height?: number;
}

export function UserGrowthChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="totalUsers" 
          stroke="#8884d8" 
          fill="#8884d8"
          fillOpacity={0.3}
          name="Total Usuarios"
        />
        <Area 
          type="monotone" 
          dataKey="totalProviders" 
          stroke="#82ca9d" 
          fill="#82ca9d"
          fillOpacity={0.3}
          name="Total Profesionales"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']} />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#ffc658" 
          strokeWidth={3}
          name="Ingresos"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryPerformanceChart({ data, height = 400 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="categoryName" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="requests" fill="#8884d8" name="Solicitudes" />
        <Bar dataKey="completedRequests" fill="#82ca9d" name="Completadas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PaymentMethodsPieChart({ data, height = 300 }: ChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088aa'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyRevenueChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']} />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#ffc658" 
          fill="#ffc658"
          fillOpacity={0.3}
          name="Ingresos Mensuales"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CreditTrendChart({ data, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="credits" 
          stroke="#8884d8" 
          fill="#8884d8"
          fillOpacity={0.3}
          name="Créditos Vendidos" 
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#82ca9d" 
          fill="#82ca9d"
          fillOpacity={0.3}
          name="Ingresos ($)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ConversionFunnelChart({ data, height = 400 }: ChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="horizontal" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="step" width={100} />
        <Tooltip formatter={(value, name) => [Number(value).toLocaleString(), name]} />
        <Bar dataKey="count" name="Usuarios">
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProviderPerformanceChart({ data, height = 400 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="businessName" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalRequests" fill="#8884d8" name="Solicitudes" />
        <Bar dataKey="completedRequests" fill="#82ca9d" name="Completadas" />
      </BarChart>
    </ResponsiveContainer>
  );
}
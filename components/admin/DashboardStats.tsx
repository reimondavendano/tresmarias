import React, { useEffect } from 'react';
import { Calendar, DollarSign, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import Chart.js and react-chartjs-2 components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Import Redux hooks and thunks
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBookings } from '@/store/slices/bookingSlice';
import { fetchAllCustomers } from '@/store/slices/customerSlice';

// Import the types from your types/index.ts file
import { Booking, Customer } from '@/types'; // Assuming your types file is at '@/types/index.ts'

export default function App() {
  const dispatch = useAppDispatch();
  // Add fallback empty array to prevent 'undefined' errors
  const bookings = useAppSelector((state) => state.booking.bookings || []);
  const isLoadingBookings = useAppSelector((state) => state.booking.isLoading);

  // Add fallback empty array to prevent 'undefined' errors
  const customers = useAppSelector((state) => state.customers.customers || []);
  const isLoadingCustomers = useAppSelector((state) => state.customers.isLoadingCustomer);

  // Fetch bookings and all customers on component mount
  useEffect(() => {
    dispatch(fetchBookings(10)); // Fetch a reasonable limit of bookings
    dispatch(fetchAllCustomers()); // Fetch all customers
  }, [dispatch]);

  // Determine which bookings data to use for calculations
  // Now always uses data from Redux store
  const dataBookings = bookings;
  const dataIsLoadingBookings = isLoadingBookings;

  // Helper function to get data for a specific month
  const getBookingsForMonth = (data: Booking[], date: Date, status?: Booking['status']) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return data.filter(booking => {
      if (!booking.created_at) return false;
      const bookingDate = new Date(booking.created_at);
      const matchesMonth = bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
      const matchesStatus = status ? booking.status === status : true;
      return matchesMonth && matchesStatus;
    });
  };

  const getCustomersForMonth = (data: Customer[], date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return data.filter(customer => {
      if (!customer.created_at) return false;
      const customerDate = new Date(customer.created_at);
      return customerDate.getMonth() === month && customerDate.getFullYear() === year;
    });
  };

  // Calculate change data (percentage or absolute)
  const getChangeData = (currentValue: number, previousValue: number) => {
    if (previousValue === 0 && currentValue === 0) {
      return { change: '0%', changeType: 'neutral' };
    }
    if (previousValue === 0 && currentValue > 0) {
      return { change: `+${currentValue}`, changeType: 'positive' }; // Absolute increase if previous was zero
    }
    if (previousValue === 0 && currentValue < 0) {
      return { change: `${currentValue}`, changeType: 'negative' }; // Absolute decrease if previous was zero
    }

    const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
    const changeSign = percentageChange >= 0 ? '+' : '';
    const changeType = percentageChange >= 0 ? 'positive' : 'negative';

    return {
      change: `${changeSign}${percentageChange.toFixed(0)}%`,
      changeType: changeType,
    };
  };

  // Get current and previous month dates
  const today = new Date();
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Calculate dynamic statistics for current month
  const currentMonthTotalBookings = getBookingsForMonth(dataBookings, currentMonthDate).length;
  const currentMonthConfirmedBookings = getBookingsForMonth(dataBookings, currentMonthDate, 'confirmed').length;
  const currentMonthPendingBookings = getBookingsForMonth(dataBookings, currentMonthDate, 'pending').length;
  const currentMonthCancelledBookings = getBookingsForMonth(dataBookings, currentMonthDate, 'cancelled').length;
  const currentMonthActiveCustomers = getCustomersForMonth(customers, currentMonthDate).length;


  // Calculate dynamic statistics for previous month
  const previousMonthTotalBookings = getBookingsForMonth(dataBookings, previousMonthDate).length;
  const previousMonthConfirmedBookings = getBookingsForMonth(dataBookings, previousMonthDate, 'confirmed').length;
  const previousMonthPendingBookings = getBookingsForMonth(dataBookings, previousMonthDate, 'pending').length;
  const previousMonthCancelledBookings = getBookingsForMonth(dataBookings, previousMonthDate, 'cancelled').length;
  const previousMonthActiveCustomers = getCustomersForMonth(customers, previousMonthDate).length;


  // Calculate monthly revenue for chart
  const calculateMonthlyRevenue = () => {
    const revenueByMonth: { [key: string]: number } = {};
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1); // Start 6 months ago

    // Initialize for the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      revenueByMonth[monthYear] = 0;
    }

    dataBookings.forEach((booking: Booking) => { // Use dataBookings here
      // Ensure booking.service exists, and its price is a valid number
      if (booking.status === 'confirmed' && booking.service && typeof booking.service.price === 'number' && booking.service.price > 0 && booking.created_at) {
        const bookingDate = new Date(booking.created_at);
        if (!isNaN(bookingDate.getTime())) {
          const monthYear = bookingDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          if (revenueByMonth.hasOwnProperty(monthYear)) {
            revenueByMonth[monthYear] += booking.service.price;
          }
        }
      }
    });

    // Convert to array for Chart.js, ensuring correct order
    const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => ({
      name: month,
      revenue: revenueByMonth[month],
    }));
  };

  const monthlyRevenueData = calculateMonthlyRevenue();
  const currentMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue || 0;
  const previousMonthRevenue = monthlyRevenueData.length > 1 ? monthlyRevenueData[monthlyRevenueData.length - 2]?.revenue || 0 : 0;

  // Calculate changes
  const totalBookingsChange = getChangeData(currentMonthTotalBookings, previousMonthTotalBookings);
  const confirmedBookingsChange = getChangeData(currentMonthConfirmedBookings, previousMonthConfirmedBookings);
  const pendingBookingsChange = getChangeData(currentMonthPendingBookings, previousMonthPendingBookings);
  const cancelledBookingsChange = getChangeData(currentMonthCancelledBookings, previousMonthCancelledBookings);
  const monthlyRevenueChange = getChangeData(currentMonthRevenue, previousMonthRevenue);
  const activeCustomersChange = getChangeData(currentMonthActiveCustomers, previousMonthActiveCustomers);


  const stats = [
    {
      title: 'Total Bookings',
      value: dataIsLoadingBookings ? 'Loading...' : currentMonthTotalBookings.toString(),
      change: totalBookingsChange.change,
      changeType: totalBookingsChange.changeType,
      icon: Calendar,
    },
    {
      title: 'Confirmed Bookings',
      value: dataIsLoadingBookings ? 'Loading...' : currentMonthConfirmedBookings.toString(),
      change: confirmedBookingsChange.change,
      changeType: confirmedBookingsChange.changeType,
      icon: CheckCircle,
    },
    {
      title: 'Pending Bookings',
      value: dataIsLoadingBookings ? 'Loading...' : currentMonthPendingBookings.toString(),
      change: pendingBookingsChange.change,
      changeType: pendingBookingsChange.changeType,
      icon: Clock,
    },
    {
      title: 'Cancelled Bookings',
      value: dataIsLoadingBookings ? 'Loading...' : currentMonthCancelledBookings.toString(),
      change: cancelledBookingsChange.change,
      changeType: cancelledBookingsChange.changeType,
      icon: XCircle,
    },
    {
      title: 'Monthly Revenue',
      value: dataIsLoadingBookings ? 'Loading...' : `P${currentMonthRevenue.toLocaleString()}`,
      // Note: lucide-react does not have a specific 'PhilippinePeso' icon.
      // Using DollarSign as a generic currency icon.
      change: monthlyRevenueChange.change,
      changeType: monthlyRevenueChange.changeType,
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: isLoadingCustomers ? 'Loading...' : currentMonthActiveCustomers.toString(),
      change: activeCustomersChange.change,
      changeType: activeCustomersChange.changeType,
      icon: Users,
    },
  ];

  // Chart.js data structure
  const chartData = {
    labels: monthlyRevenueData.map(data => data.name),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyRevenueData.map(data => data.revenue),
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Tailwind indigo-500 with opacity
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4, // Rounded corners for bars
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill its container
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cc145bff', // text-gray-700
        }
      },
      title: {
        display: false, // Title is handled by CardTitle
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `P${context.parsed.y.toLocaleString()}`;
            }
            return label;
          }
        },
        backgroundColor: '#fff',
        bodyColor: '#cc145bff',
        titleColor: '#cc145bff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
          borderColor: '#e5e7eb', // Border color for x-axis
        },
        ticks: {
          color: '#6b7280', // text-gray-600
        },
      },
      y: {
        grid: {
          borderColor: '#e5e7eb', // Border color for y-axis
          color: '#e5e7eb', // Grid line color
        },
        ticks: {
          color: '#6b7280', // text-gray-600
          callback: function(value: any) {
            return `P${value.toLocaleString()}`; // Format Y-axis labels as Philippine Peso
          }
        },
      },
    },
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-indigo-600" /> {/* Using a consistent color */}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive'
                  ? 'text-green-600'
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Bar Chart */}
      <Card className="col-span-full p-6 shadow-lg rounded-xl">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80 w-full flex items-center justify-center">
          {dataIsLoadingBookings ? (
            <p className="text-gray-500">Loading chart data...</p>
          ) : monthlyRevenueData.length === 0 || monthlyRevenueData.every(data => data.revenue === 0) ? (
            <p className="text-gray-500">No revenue data available for the last 6 months.</p>
          ) : (
            <div className="w-full h-full"> {/* Chart.js needs a div with defined dimensions */}
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

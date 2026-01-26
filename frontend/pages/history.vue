<template>
  <div class="p-0 md:p-10">
    <h2 class="text-2xl font-bold mb-4">Booking History</h2>
    <table class="w-full">
      <thead class="">
        <tr class="bg-gray-300">
          <th class="p-3 w-[30%]">Building</th>
          <th class="p-3 w-[20%]">Floor</th>
          <th class="p-3 w-[15%]">Seat</th>
          <th class="p-3 w-[25%]">Date</th>
          <th class="p-3 w-[10%]">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id" class="border-t">
          <td class="p-3">{{ booking.buildingName }}</td>
          <td class="p-3">{{ booking.floorName }}</td>
          <td class="p-3">{{ booking.seatNumber }}</td>
          <td class="p-3">{{ booking.date }}</td>
          <td class="p-3">
            <button
              v-if="!dayjs(booking.date).isBefore(dayjs().startOf('day'))"
              @click="handleDelete(booking.id)"
              class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <span v-else class="text-gray-500 text-sm">Complete</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBookingHistory, deleteBooking } from '../services/api';
import dayjs from 'dayjs';

// Define the Booking interface based on expected API response
interface Booking {
  id: number;
  buildingName: string;
  floorName: string;
  seatNumber: string;
  date: string; // "YYYY-MM-DD"
  [key: string]: any; // Allow for additional fields if needed
}

// bookings ref
const bookings = ref<Booking[]>([]);

const fetchBookings = async (): Promise<void> => {
  try {
    const response: Booking[] = await getBookingHistory();
    // sort by date
    bookings.value = response.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
    console.log('Bookings fetched & sorted:', bookings.value);
  } catch (err: unknown) {
    console.error('Failed to fetch bookings:', err);
  }
};

const handleDelete = async (bookingId: number): Promise<void> => {
  const targetBooking = bookings.value.find(b => b.id === bookingId);

  if (targetBooking) {
    const today = dayjs().startOf('day');
    const bookingDate = dayjs(targetBooking.date);

    if (bookingDate.isBefore(today)) {
      alert('Booking history (records prior to today) cannot be deleted!');
      return;
    }
  }

  if (!confirm('Are you sure you want to delete this booking?')) return;

  try {
    await deleteBooking(bookingId);
    console.log('Booking deleted:', bookingId);
    alert('Booking deleted successfully!');
    await fetchBookings();
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    console.error('Failed to delete booking:', err);
    alert('Failed to delete booking: ' + (error.response?.data?.message || 'Unknown error'));
  }
};

onMounted(fetchBookings);
</script>

<style scoped>
table {
  border: 1px solid #ddd;
}
th,
td {
  text-align: left;
}
</style>

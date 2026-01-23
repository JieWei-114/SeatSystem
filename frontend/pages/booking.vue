<template>
  <div class="p-10">
    <div class="flex mb-4 justify-between">
      <h1 class="text-2xl font-bold">Booking</h1>
      <div v-if="authStore.user" class="flex text-lg items-center">
        <h1>Welcome, &nbsp;</h1>
        <h1 class="font-bold">{{ authStore.user.username }} - {{ authStore.user.role }}</h1>
      </div>
    </div>
    <div class="bg-gray-300 rounded-3xl mb-5">
      <div class="p-6">
        <div class="flex mb-4">
          <div class="w-[30%] pr-8">
            <label class="block mb-2">Select Date</label>
            <input
              type="date"
              v-model="selectedDate"
              class="w-full p-2 border rounded"
              :min="today"
            />
          </div>
          <div class="w-[35%] pr-8">
            <label class="block mb-2">Building</label>
            <select
              v-model="selectedBuildingId"
              @change="updateFloors"
              :disabled="!selectedDate"
              class="w-full p-2 border rounded"
            >
              <option value="">Select Building</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </div>
          <div class="w-[25%] pr-8">
            <label class="block mb-2">Floor</label>
            <select
              v-model="selectedFloorId"
              @change="loadFloorPlan"
              class="w-full p-2 border rounded"
              :disabled="!selectedBuildingId"
            >
              <option value="">Select Floor</option>
              <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                {{ floor.name }}
              </option>
            </select>
          </div>
          <div class="mt-8 w-[15%]">
            <button
              @click="bookSelectedSeat"
              class="p-2 w-full bg-gray-800 text-white rounded hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
              :disabled="!selectedDate || !selectedSeat || !selectedSeat.available"
            >
              Book
            </button>
          </div>
        </div>
        <div class="border w-full h-10 mt-2 rounded mb-2 bg-white">
          <p class="p-2">Description: {{ floorDescription }}</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col lg:flex-row gap-3 min-h-[600px]">
      <div
        class="relative flex-grow border-2 border-gray-300 rounded-2xl overflow-hidden bg-slate-50 shadow-inner group"
      >
        <div class="overflow-auto custom-scrollbar" ref="viewportElement" @wheel="onWheel">
          <div
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: '0 0',
            }"
            class="transition-transform duration-200 ease-out"
          >
            <canvas ref="canvasElement" class="block"></canvas>
          </div>
        </div>

        <div
          v-if="canvasVisible"
          class="absolute bottom-4 left-4 flex items-center bg-white/90 backdrop-blur shadow-lg rounded-xl border border-gray-200 p-1 z-10"
        >
          <button @click="zoomOut">−</button>
          <div class="px-3 text-center min-w-[60px]">
            <span class="text-sm font-mono font-bold text-gray-700"
              >{{ Math.round(zoomLevel * 100) }}%</span
            >
          </div>
          <button @click="zoomIn">+</button>
          <div class="w-[1px] h-6 bg-gray-200 mx-1"></div>
          <button
            class="px-3 py-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase"
            @click="resetZoom"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="w-full lg:w-48 flex flex-col gap-4 shrink-0">
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-grow"
        >
          <div class="bg-gray-800 p-4">
            <h3 class="text-white font-bold text-sm uppercase tracking-wider">Selection Info</h3>
          </div>

          <div class="p-4 flex flex-col h-full">
            <div v-if="selectedSeat" class="space-y-4 fade-in duration-300">
              <div>
                <label>Seat Number</label>
                <p class="text-2xl font-black text-gray-800">{{ selectedSeat.seatNumber }}</p>
              </div>
              <div>
                <label>Description</label>
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ selectedSeat.description || 'No description provided.' }}
                </p>
              </div>
              <div>
                <label>Status</label>
                <div class="flex items-center mt-1">
                  <span
                    :class="selectedSeat.available ? 'bg-green-500' : 'bg-red-500'"
                    class="w-3 h-3 rounded-full mr-2"
                  ></span>
                  <span
                    class="font-bold"
                    :class="selectedSeat.available ? 'text-green-700' : 'text-red-700'"
                  >
                    {{ selectedSeat.available ? 'Ready to Book' : 'Occupied' }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex-grow flex flex-col items-center justify-center text-center p-6 text-gray-400"
            >
              <p class="text-sm">Click a seat on the map to see details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { getBuildingsAndFloors, getFloorPlan, bookingSeat, getBookingHistory  } from '~/services/api';
import * as fabric from 'fabric';

const buildings = ref([]);
const floors = ref([]);
const selectedBuildingId = ref('');
const selectedFloorId = ref('');
const floorDescription = ref('');
const canvasVisible = ref(false);
const canvasElement = ref(null);
const selectedDate = ref('');
const selectedSeat = ref(null);
const bookingHistory = ref([]);
const zoomLevel = ref(1);
const viewportElement = ref(null);

let fabricCanvas = null; // Use let for reassignment

const authStore = useAuthStore();
const router = useRouter();

const BASE_URL = 'http://localhost:5000'; // Backend base URL

// Set today's date as the minimum (YYYY-MM-DD format)
const today = new Date().toISOString().split('T')[0];

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    fetchBuildings();
    fetchBookingHistory();
  }
});

watch([selectedDate], () => {
  selectedBuildingId.value = ''; // Reset building when date changes
  selectedFloorId.value = ''; // Reset floor when date changes
  floors.value = []; // Clear floors
  canvasVisible.value = false; // Hide canvas
  if (fabricCanvas) {
    fabricCanvas.clear(); // Clear canvas
  }
});

const hasBookedOnDate = (date) => {
  return bookingHistory.value.some(b => b.date === date);
};

const fetchBuildings = async () => {
  try {
    const data = await getBuildingsAndFloors();
    buildings.value = data.data;
    console.log('Buildings fetched:', data.data);
  } catch (err) {
    console.error('Failed to fetch buildings:', err);
  }
};

const fetchBookingHistory = async () => {
  try {
    bookingHistory.value = await getBookingHistory();
  } catch (err) {
    console.error('Failed to fetch booking history:', err);
  }
};

const updateFloors = () => {
  const building = buildings.value.find(b => b.id === Number(selectedBuildingId.value));
  floors.value = building ? building.floors : [];
  selectedFloorId.value = '';
  floorDescription.value = '';
  canvasVisible.value = true;
  zoomLevel.value = 1;
  if (fabricCanvas) {
    fabricCanvas.clear();
  }
};

const loadFloorPlan = async () => {
  const floor = floors.value.find(f => f.id === Number(selectedFloorId.value));
  floorDescription.value = floor ? floor.description : '';
  if (!selectedFloorId.value) {
    canvasVisible.value = false;
    return;
  }

  try {
    const data = await getFloorPlan(Number(selectedFloorId.value));
    console.log('Floor plan fetched:', data);

    const { imagePath, seats } = data;
    if (!imagePath || !seats) {
      console.error('Missing imagePath or seats in floor plan:', data);
      return;
    }

    const imageUrl = `${BASE_URL}${imagePath}`;
    console.log('Loading image from:', imageUrl);

    const canvasEl = canvasElement.value;

    if (!canvasEl) {
      console.error('Canvas element not found');
      return;
    }

    // Preload the image
    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = imageUrl;

    imgElement.onload = () => {
      console.log('Image preloaded:', imgElement.width, 'x', imgElement.height);

      // Get the container width dynamically
      const containerWidth = canvasEl.parentElement.clientWidth;
      const canvasHeight = 500;

      const bgImage = new fabric.FabricImage(imgElement, {
        scaleX: containerWidth / imgElement.width, // Scale to fit container width
        scaleY: canvasHeight / imgElement.height, // Scale to fit fixed height
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      // Dispose of old canvas if it exists
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }

      // Initialize new canvas with background image
      fabricCanvas = new fabric.Canvas(canvasEl, {
        width: containerWidth,
        height: canvasHeight,
        backgroundImage: bgImage,
      });

      const date = selectedDate.value || today;
      seats.forEach((seatData) => {
        const isBooked = bookingHistory.value.some(b => b.seatNumber === seatData.seatNumber && b.date === date);
        console.log('Checking date:', date);
        console.log('Booking history dates:', bookingHistory.value.map(b => b.date));
        console.log('Booking history seat:', bookingHistory.value.map(b => b.seatNumber));
        const square = new fabric.Rect({
          left: 0,
          top: 0,
          width: 10,
          height: 15,
          fill: isBooked ? 'red' : seatData.available ? '#0fae00' : '#888888',
          originX: "center",
          originY: "center",
        });
        const rectangle = new fabric.Rect({
          left: 0,
          top: 3, // Position below the square
          width: 20, // Wider than the square
          height: 12,
          fill: isBooked ? 'red' : seatData.available ? '#0fae00' : '#888888',
          originX: "center",
          originY: "center",
        });
        const seat = new fabric.Group([rectangle, square], {
          left: seatData.x,
          top: seatData.y,
          angle: seatData.angle || 0,
          scaleX: seatData.scaleX || 1,
          scaleY: seatData.scaleY || 1,
          width: seatData.width || 15,
          height: seatData.height || 15,
          fill: isBooked ? 'red' : seatData.available ? '#0fae00' : '#888888',
          selectable: !isBooked && seatData.available,
          evented: true,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false,
          hasBorders: true,
          hoverCursor: (!isBooked && seatData.available) ? 'pointer' : 'not-allowed',
        });
        seat.seatData = seatData;
        fabricCanvas.add(seat);
        console.log('Seat added:', seatData);
      });

    fabricCanvas.on('selection:created', (e) => {
    if (e.selected?.[0]?.seatData) {
      selectedSeat.value = e.selected[0].seatData;
      e.selected[0].set('fill', '#73d56a');
      fabricCanvas.renderAll();
      console.log('Seat selected:', selectedSeat.value);
    }
  });

  fabricCanvas.on('selection:updated', (e) => {
    // Reset previous selection
    if (e.deselected?.[0]?.seatData) {
      const prevSeat = e.deselected[0];
      const isBooked = bookingHistory.value.some(b => b.seatId === prevSeat.seatData.id && b.date === selectedDate.value);
      prevSeat.set('fill', isBooked ? '#73d56a' : prevSeat.seatData.available ? '#0fae00' : '#888888');
    }
    // Set new selection
    if (e.selected?.[0]?.seatData) {
      selectedSeat.value = e.selected[0].seatData;
      e.selected[0].set('fill', '#73d56a');
    }
    fabricCanvas.renderAll();
    console.log('Seat selection updated:', selectedSeat.value);
  });

  fabricCanvas.on('selection:cleared', (e) => {
    if (e.deselected?.[0]?.seatData) {
      const prevSeat = e.deselected[0];
      const isBooked = bookingHistory.value.some(b => b.seatId === prevSeat.seatData.id && b.date === selectedDate.value);
      prevSeat.set('fill', isBooked ? 'red' : prevSeat.seatData.available ? '#0fae00' : '#888888');
      fabricCanvas.renderAll();
    }
    selectedSeat.value = null;
    console.log('Seat selection cleared');
  });

      fabricCanvas.renderAll();
      console.log('Floor plan rendered with', seats.length, 'seats');
    };
    imgElement.onerror = (err) => {
      console.error('Failed to preload image:', err);
    };
  } catch (err) {
    console.error('Failed to load floor plan:', err);
    canvasVisible.value = false;
  }
};

// Zoom functions
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(3, zoomLevel.value + 0.1);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.3) {
    zoomLevel.value = Math.max(0.3, zoomLevel.value - 0.1);
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  if (viewportElement.value) {
    viewportElement.value.scrollTop = 0;
    viewportElement.value.scrollLeft = 0;
  }
};

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  };

const bookSelectedSeat = async () => {
  if (hasBookedOnDate(selectedDate.value)) {
    alert('You already booked a seat for this date.');
    return;
  }

  if (!selectedDate.value || !selectedSeat.value || !selectedSeat.value.available) {
    alert('Please select a date and an available seat.');
    return;
  }

  const currentDate = new Date().setHours(0, 0, 0, 0); // Ensure time is reset
  const bookingDate = new Date(selectedDate.value).setHours(0, 0, 0, 0);
  if (bookingDate < currentDate) {
    alert('You cannot book a date before today.');
    return;
  }

  try {
    const seatId = selectedSeat.value.id;
    const date = selectedDate.value;
    console.log('Booking data:', { seatId, date });
    const response = await bookingSeat(seatId, date);
    console.log('Seat booked:', response);
    alert('Seat booked successfully!');

    // Disable selection after booking
    selectedSeat.value.available = false;
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.seatData.id === selectedSeat.value.id) {
        obj.set('fill', '#888888');
        obj.set('selectable', false);
        obj.set('hoverCursor', 'not-allowed');
      }
    });

    fetchBookingHistory();
    selectedSeat.value = null;
  } catch (err) {
    console.error('Failed to book seat:', err);
    alert('Failed to book seat: ' + (err.message || 'Unknown error'));
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full hover:bg-gray-400 transition-colors;
}
</style>
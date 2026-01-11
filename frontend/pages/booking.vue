<template>
  <div class="p-10">
    <div class="flex mb-4 justify-between">
      <h1 class="text-2xl font-bold">Booking</h1>
      <div v-if="authStore.user" class="flex text-lg items-center">
        <h1>Welcome, &nbsp;</h1>
        <h1 class="font-bold">
          {{ authStore.user.username }} - {{ authStore.user.role }}
        </h1>
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
            <label class="block mb-2">Select Building and Floor</label>
            <select
              v-model="selectedBuildingId"
              @change="updateFloors"
              :disabled="!selectedDate"
              class="w-full p-2 border rounded"
            >
              <option value="">Select Building</option>
              <option
                v-for="building in buildings"
                :key="building.id"
                :value="building.id"
              >
                {{ building.name }}
              </option>
            </select>
          </div>
          <div class="w-[20%] pr-8">
            <select
              v-model="selectedFloorId"
              @change="loadFloorPlan"
              class="w-full p-2 border rounded mt-8"
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
              :disabled="
                !selectedDate || !selectedSeat || !selectedSeat.available
              "
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
    <div class="canvas-container border-black border-2 rounded-xl">
      <canvas ref="canvasElement" v-show="canvasVisible"></canvas>
      <div v-if="selectedSeat" class="seat-info">
        <p>Seat: {{ selectedSeat.seatNumber }}</p>
        <p>Description: {{ selectedSeat.description }}</p>
        <p>Available: {{ selectedSeat.available ? "Yes" : "No" }}</p>
      </div>
      <!-- Zoom Buttons
      <div v-if="canvasVisible" class="zoom-controls">
        <button
          @click="zoomCanvas(0.1)"
          class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          +
        </button>
        <button
          @click="zoomCanvas(-0.1)"
          class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
        >
          -
        </button>
      </div> -->
      <!-- <div v-if="hoveredSeat" class="seat-info">
        <p>Seat: {{ hoveredSeat.seatNumber }}</p>
        <p>Description: {{ hoveredSeat.description }}</p>
        <p>Available: {{ hoveredSeat.available ? 'Yes' : 'No' }}</p>
      </div> -->
    </div>
    <!-- <div class="mt-4">
      <h2 class="text-xl font-bold mb-2">Booking History</h2>
      <ul v-if="bookingHistory.length > 0" class="border rounded p-2">
        <li
          v-for="booking in bookingHistory"
          :key="booking.id"
          class="p-2 border-b"
        >
          {{ booking.date }} - {{ booking.buildingName }} - Floor
          {{ booking.floorName }} - Seat {{ booking.seatNumber }}
        </li>
      </ul>
      <p v-else>No bookings yet.</p>
    </div> -->
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';
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
// const hoveredSeat = ref(null);
const canvasElement = ref(null);
const selectedDate = ref('');
const selectedSeat = ref(null);
const bookingHistory = ref([]);
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

// const zoomCanvas = (delta) => {
//   if (!fabricCanvas) return;
//   let zoom = fabricCanvas.getZoom();
//   zoom += delta;
//   if (zoom > 2) zoom = 2; // Max zoom in
//   if (zoom < 1) zoom = 1; // Max zoom out
//   fabricCanvas.setZoom(zoom);
//   fabricCanvas.renderAll();
// };

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

    // Preload the image like FloorPlanEditor
    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = imageUrl;

    imgElement.onload = () => {
      console.log('Image preloaded:', imgElement.width, 'x', imgElement.height);

      // Get the container width dynamically
      const containerWidth = canvasEl.parentElement.clientWidth;
      const canvasHeight = 500; // Fixed height from CSS

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
        width: containerWidth, // Match container width
        height: canvasHeight, // Fixed height
        backgroundImage: bgImage,
      });

      // Enable zoom with mouse wheel
      // fabricCanvas.on('mouse:wheel', (opt) => {
      //   const delta = opt.e.deltaY;
      //   let zoom = fabricCanvas.getZoom();
      //   zoom *= 0.999 ** delta;
      //   if (zoom > 2) zoom = 2; // Max zoom in
      //   if (zoom < 1) zoom = 1; // Max zoom out
      //   fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      //   opt.e.preventDefault();
      //   opt.e.stopPropagation();
      // });

      // https://fabricjs.com/docs/old-docs/fabric-intro-part-5/

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
          width: 15,
          height: 15,
          fill: isBooked ? 'red' : seatData.available ? '#0fae00' : '#888888',
          selectable: !isBooked && seatData.available,
          evented: true,
          lockMovementX: true, // Lock movement horizontally
          lockMovementY: true, // Lock movement vertically
          lockRotation: true, // Prevent rotation
          lockScalingX: true, // Prevent horizontal scaling
          lockScalingY: true, // Prevent vertical scaling
          hasControls: false, // Hide rotate/resize controls
          hasBorders: true, // Keep selection border visible
          hoverCursor: (!isBooked && seatData.available) ? 'pointer' : 'not-allowed',
      });
        seat.seatData = seatData;
        fabricCanvas.add(seat);
        console.log('Seat added:', seatData);
      });

    //   fabricCanvas.on('mouse:over', (e) => {
    //   if (e.target && e.target.seatData) {
    //     selectedSeat.value = e.target.seatData;
    //     fabricCanvas.renderAll();
    //     console.log('Hover over:', e.target.seatData);
    //   }
    // });

    // fabricCanvas.on('mouse:out', (e) => {
    //   if (e.target && e.target.seatData) {
    //     fabricCanvas.renderAll();
    //     selectedSeat.value = null;
    //     console.log('Hover out');
    //   }
    // });

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
const bookSelectedSeat = async () => {
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
      if (obj.seatData && obj.seatData.id === selectedSeat.value.id) {
        obj.set('fill', '#888888');
        obj.set('selectable', false);
        obj.set('hoverCursor', 'not-allowed');
      }
    });

    fabricCanvas.renderAll();
    fetchBookingHistory();
    selectedSeat.value = null;
    fabricCanvas.discardActiveObject();
  } catch (err) {
    console.error('Failed to book seat:', err);
    alert('Failed to book seat: ' + (err.message || 'Unknown error'));
  }
};
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 500px;
}

.seat-info {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
}
/* .zoom-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
} */
</style>

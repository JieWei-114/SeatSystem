<template>
  <div class="">
    <div class="w-full mt-2 p-5 border rounded bg-gray-300 mb-2">
      <h1 class="font-bold text-xl pb-2">Floor Plan Editor</h1>
      <div class="flex justify-between">
        <div v-if="!isViewingFloorPlan">
          <input type="file" accept="image/*" @change="uploadFloorPlan" />
        </div>
        <div v-if="!isViewingFloorPlan">
          <button
            class="mr-2 p-1 pl-3 pr-3 bg-gray-500 rounded text-white"
            @click="addSeat"
          >
            Add Seat
          </button>
          <button
            class="mr-2 p-1 pl-3 pr-3 bg-gray-500 rounded text-white"
            :disabled="!selectedSeat"
            @click="deleteSeat"
          >
            Delete Seat
          </button>
          <button
            class="mr-2 p-1 pl-3 pr-3 bg-gray-500 rounded text-white"
            :disabled="!selectedSeat"
            @click="lockSeat"
          >
            Lock Seat
          </button>
          <button
            class="mr-2 p-1 pl-3 pr-3 bg-gray-500 rounded text-white"
            :disabled="!selectedSeat"
            @click="unlockSeat"
          >
            Unlock Seat
          </button>
        </div>
        <div>
          <button
            class="p-1 pl-3 pr-3 bg-gray-500 rounded text-white"
            @click="saveFloorPlan"
          >
            Save Floor Plan
          </button>
        </div>
      </div>
    </div>
    <div class="canvas-container border-black border-2 rounded-xl">
      <canvas ref="canvasElement"></canvas>
    </div>
    <div class="w-full mt-2 p-2 border rounded bg-gray-300 relative h-[180px]">
      <div class="flex">
        <div v-if="selectedSeat">
          <h2 class="font-bold text-lg">Seat info</h2>
          <label>
            Seat Number:
            <input
              class="border rounded bg-gray-100 ml-1 pl-2 p-1 text-sm"
              v-model="selectedSeat.seatNumber"
            />
          </label>
          <label>
            Description:
            <input
              class="border rounded bg-gray-100 ml-1 pl-2 p-1 text-sm"
              v-model="selectedSeat.description"
            />
          </label>
          <label>
            <div class="flex items-center cursor-pointer">
              <span class="mr-1">Available:</span>
              <input
                type="checkbox"
                v-model="selectedSeat.available"
                class="hidden"
              />
              <div
                class="w-4 h-4 bg-gray-500 border-2 border-gray-600 rounded flex items-center justify-center transition-all"
              >
                <svg
                  v-if="selectedSeat.available"
                  class="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div
          class="grid grid-cols-3 gap-2 m-3 w-[15%] absolute right-[10px]"
          v-if="!isViewingFloorPlan"
        >
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('upper-left')"
          >
            ⇖
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('up')"
          >
            ⇑
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('upper-right')"
          >
            ⇗
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('left')"
          >
            ⇐
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('rotation')"
          >
            ↺
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('right')"
          >
            ⇒
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('lower-left')"
          >
            ⇙
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('down')"
          >
            ⇓
          </button>
          <button
            class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!selectedSeat || selectedSeat.locked"
            @click="moveSeat('lower-right')"
          >
            ⇘
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';
import * as fabric from 'fabric';
import { getFloorPlan, createFloorPlan, updateFloorPlan } from '../services/api';

const BASE_URL = 'http://localhost:5000';

const props = defineProps({
  floorId: {
    type: [Number, String],
    required: true,
  },
  isViewingFloorPlan: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['floor-plan-saved']);

const canvasElement = ref(null);
const selectedSeat = ref(null);
const seats = ref([]);
const hasExistingFloorPlan = ref(false);
let fabricCanvas = null;

onMounted(() => {
  initCanvas();
  loadFloorPlan();
});

const initCanvas = () => {
  const canvasEl = canvasElement.value;
  if (!canvasEl) {
    console.error("Canvas element not found");
    return;
  }

  const containerWidth = canvasEl.parentElement.clientWidth;
  const canvasHeight = 500;

  fabricCanvas = new fabric.Canvas(canvasEl, {
    width: containerWidth,
    height: canvasHeight,
  });

  console.log("Canvas initialized:", fabricCanvas instanceof fabric.Canvas);
  console.log("add available:", typeof fabricCanvas.add === "function");

  fabricCanvas.on("object:moving", (e) => updateSeatPosition(e.target));
  fabricCanvas.on("object:rotating", (e) => updateSeatRotation(e.target));
  fabricCanvas.on("selection:created", (e) => selectSeat(e.selected?.[0]));
  fabricCanvas.on("selection:updated", (e) => selectSeat(e.selected?.[0]));
  fabricCanvas.on("selection:cleared", () => (selectedSeat.value = null));
};

const uploadFloorPlan = (event) => {
  console.log("uploadFloorPlan triggered with event:", event);
  const file = event?.target?.files?.[0];
  if (!file) {
    console.error("No file selected");
    return;
  }
  const canvasEl = canvasElement.value;
  if (!canvasEl) {
    console.error("Canvas element not found");
    return;
  }

  console.log("Uploading file:", file.name, file.type, file.size);
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgElement = new Image();
    imgElement.src = e.target.result;

    imgElement.onload = () => {
      const containerWidth = canvasEl.parentElement.clientWidth;
      const canvasHeight = 500;

      const bgImage = new fabric.Image(imgElement, {
        scaleX: containerWidth / imgElement.width,
        scaleY: canvasHeight / imgElement.height,
        left: 0,
        top: 0,
        selectable: false,
      });
      console.log("Image loaded:", imgElement.width, "x", imgElement.height);

      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
      fabricCanvas = new fabric.Canvas(canvasEl, {
        width: containerWidth,
        height: canvasHeight,
        backgroundImage: bgImage,
      });

      fabricCanvas.on("object:moving", (e) => updateSeatPosition(e.target));
      fabricCanvas.on("object:rotating", (e) => updateSeatRotation(e.target));
      fabricCanvas.on("selection:created", (e) => selectSeat(e.selected?.[0]));
      fabricCanvas.on("selection:updated", (e) => selectSeat(e.selected?.[0]));
      fabricCanvas.on("selection:cleared", () => (selectedSeat.value = null));
      console.log("Canvas re-initialized with background:", fabricCanvas.backgroundImage);

      fabricCanvas.renderAll();
      console.log("Canvas rendered with background and seats");
    };
    imgElement.onerror = () => console.error("Failed to load image element");
  };
  reader.onerror = (err) => console.error("FileReader error:", err);
  reader.readAsDataURL(file);
};

const loadFloorPlan = async () => {
  try {
    const data = await getFloorPlan(props.floorId);
    if (data.imagePath) {
      hasExistingFloorPlan.value = true;
      const imageUrl = `${BASE_URL}${data.imagePath}`;
      console.log("Loading image from:", imageUrl);
      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = imageUrl;

      imgElement.onload = () => {
        const containerWidth = canvasElement.value.parentElement.clientWidth;
        const canvasHeight = 500;

        const bgImage = new fabric.Image(imgElement, {
          scaleX: containerWidth / imgElement.width,
          scaleY: canvasHeight / imgElement.height,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });

        fabricCanvas.clear();
        fabricCanvas.add(bgImage);
        seats.value = data.seats || [];

        seats.value.forEach((seatData) => {
          const square = new fabric.Rect({
            left: 0,
            top: 0,
            width: 10,
            height: 15,
            fill: seatData.available ? "#0fae00" : "#888888",
            originX: "center",
            originY: "center",
          });
          const rectangle = new fabric.Rect({
            left: 0,
            top: 3,
            width: 20,
            height: 12,
            fill: seatData.available ? "#0fae00" : "#888888",
            originX: "center",
            originY: "center",
          });
          seatData.locked = true;
          const seat = new fabric.Group([rectangle, square], {
            left: seatData.x,
            top: seatData.y,
            angle: seatData.angle || 0,
            fill: seatData.available ? "#0fae00" : "#888888",
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            cornerSize: 6,
            hoverCursor: "pointer",
          });
          seat.seatData = seatData;
          fabricCanvas.add(seat);

        });
        fabricCanvas.renderAll();
        console.log("Existing floor plan rendered with", seats.value.length, "seats");
      };
      imgElement.onerror = (err) => {
        console.error("Image load failed:", err);
      };
    } else {
      console.log("No existing floor plan found for floorId:", props.floorId);
    }
  } catch (err) {
    console.error("Failed to fetch floor plan:", err);
  }
};

const addSeat = () => {
  if (!fabricCanvas) {
    console.error("Canvas not initialized");
    return;
  }
  const square = new fabric.Rect({
    left: 0,
    top: 0,
    width: 10,
    height: 15,
    fill: "#14e100",
    originX: "center",
    originY: "center",
  });
  const rectangle = new fabric.Rect({
    left: 0,
    top: 3,
    width: 20,
    height: 12,
    fill: "#14e100",
    originX: "center",
    originY: "center",
  });
  const seat = new fabric.Group([rectangle, square], {
    left: 100,
    top: 100,
    angle: 0,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    hoverCursor: "pointer",
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: true,
    lockScalingY: true,
    cornerSize: 6,
  });
  fabricCanvas.add(seat);
  const seatData = {
    seatNumber: `S${seats.value.length + 1}`,
    description: "",
    available: true,
    x: seat.left || 0,
    y: seat.top || 0,
    angle: seat.angle || 0,
    locked: false,
  };
  seats.value.push(seatData);
  seat.seatData = seatData;
  fabricCanvas.renderAll();
};

const deleteSeat = () => {
  if (!selectedSeat.value || !fabricCanvas) return;
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    fabricCanvas.remove(activeObject);
    seats.value = seats.value.filter((seat) => seat !== selectedSeat.value);
    selectedSeat.value = null;
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    console.log("Seat deleted, remaining seats:", seats.value);
  }
};

const updateSeatPosition = (target) => {
  const seatData = target.seatData;
  if (seatData) {
    seatData.x = target.left || 0;
    seatData.y = target.top || 0;
  }
};

const updateSeatRotation = (target) => {
  const seatData = target.seatData;
  if (seatData) {
    seatData.angle = target.angle || 0;
  }
};

const selectSeat = (target) => {
  if (target) {
    selectedSeat.value = target.seatData;
  }
};

const lockSeat = () => {
  if (!selectedSeat.value || !fabricCanvas) return;
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      selectable: true,
      evented: true,
    });
    activeObject.seatData.locked = true;
    fabricCanvas.renderAll();
  }
};

const unlockSeat = () => {
  if (!selectedSeat.value || !fabricCanvas) return;
  const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      selectable: true,
      evented: true,
    });
    activeObject.seatData.locked = false;
    fabricCanvas.renderAll();
  }
};

const moveSeat = (direction) => {
  if (!selectedSeat.value || !fabricCanvas) return;
  const activeObject = fabricCanvas.getActiveObject();
  if (!activeObject || activeObject.seatData.locked) return;

  const step = 10; // Movement step size in pixels
  const rotationStep = 15; // Rotation step size in degrees

  switch (direction) {
    case 'up':
      activeObject.top -= step;
      break;
    case 'down':
      activeObject.top += step;
      break;
    case 'right':
      activeObject.left += step;
      break;
    case 'left':
    activeObject.left -= step;
      break;
    case 'upper-right':
      activeObject.top -= step;
      activeObject.left += step;
      break;
    case 'upper-left':
      activeObject.top -= step;
      activeObject.left -= step;
      break;
    case 'lower-right':
      activeObject.top += step;
      activeObject.left += step;
      break;
    case 'lower-left':
      activeObject.top += step;
      activeObject.left -= step;
      break;
    case 'rotation':
      activeObject.angle = (activeObject.angle || 0) - rotationStep; // Rotate counterclockwise
      break;
    default:
      return;
  }

  updateSeatPosition(activeObject);
  updateSeatRotation(activeObject);
  fabricCanvas.renderAll();
};

const saveFloorPlan = async () => {
  if (!fabricCanvas) {
    console.error("Canvas or background image not available");
    return;
  }
  if (!fabricCanvas.backgroundImage) {
    console.error("Background image not available");
  }
  try {
    const seatData = fabricCanvas
      .getObjects()
      .filter((obj) => obj.seatData)
      .map((seat) => ({
        seatNumber: seat.seatData.seatNumber,
        description: seat.seatData.description,
        available: seat.seatData.available,
        x: seat.left || 0,
        y: seat.top || 0,
        angle: seat.angle || 0,
      }));

    let floorPlan;
    if (hasExistingFloorPlan.value) {
      floorPlan = await updateFloorPlan(props.floorId, seatData);
      alert("Floor plan updated successfully!");
    } else {
      const imageDataUrl = fabricCanvas.backgroundImage.toDataURL();
      floorPlan = await createFloorPlan(props.floorId, imageDataUrl, seatData);
      alert("Floor plan saved successfully!");
    }
    emit("floor-plan-saved", floorPlan);
  } catch (error) {
    console.error("Save floor plan error:", error);
    alert("Failed to save floor plan: " + (error.message || "Unknown error"));
  }
};
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 500px;
}

label {
  display: block;
  margin: 10px 0;
}
</style>

<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="w-full mt-2 p-3 md:p-5 border rounded bg-gray-300 mb-2">
      <div class="flex border-b border-gray-400 mb-3">
        <h1 class="font-bold text-lg md:text-xl pb-2">Floor Plan Editor</h1>

        <button class="btn-save sm:w-auto ml-auto m-1" @click="saveFloorPlan">Save Plan</button>
      </div>

      <div class="flex flex-col justify-between lg:flex-row gap-2">
        <div v-if="!isViewingFloorPlan" class="w-full">
          <input
            type="file"
            accept="image/*"
            @change="uploadFloorPlan"
            class="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-500 file:text-white hover:file:bg-gray-600"
          />
        </div>

        <div v-if="!isViewingFloorPlan" class="flex gap-2 lg:w-full">
          <button class="btn-primary" @click="addSeat">Add Seat</button>
          <button class="btn-danger" :disabled="!selectedSeat" @click="deleteSeat">Delete</button>
          <button class="btn-action" :disabled="!selectedSeat" @click="lockSeat">Lock</button>
          <button class="btn-action" :disabled="!selectedSeat" @click="unlockSeat">Unlock</button>
        </div>
        <div class="flex gap-2 items-center">
          <button class="btn-zoom" @click="zoomIn">
            <span class="text-lg font-bold">+</span>
          </button>
          <span class="text-sm font-medium px-2">{{ Math.round(zoomLevel * 100) }}%</span>
          <button class="btn-zoom" @click="zoomOut">
            <span class="text-lg font-bold">−</span>
          </button>
          <button class="btn-zoom" @click="resetZoom">
            <span class="text-xs font-bold">Reset</span>
          </button>
        </div>
      </div>
    </div>

    <div
      class="canvas-container border-black border-2 rounded-xl bg-white overflow-auto relative"
      ref="viewportElement"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel="onWheel"
    >
      <div
        ref="canvasWrapper"
        class="canvas-wrapper"
        :style="{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }"
      >
        <canvas ref="canvasElement" class="block"></canvas>
      </div>
    </div>

    <div class="w-full mt-2 p-3 md:p-4 border rounded bg-gray-300 relative lg:h-[180px]">
      <div class="flex flex-col lg:flex-row justify-between gap-6">
        <div v-if="selectedSeat" class="flex-1 border-b border-gray-400">
          <h2 class="font-bold text-lg pb-1">Seat Info</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex flex-col text-sm font-medium">
              Seat Number:
              <input
                class="mt-1 border rounded bg-gray-100 p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                v-model="selectedSeat.seatNumber"
              />
            </label>
            <label class="flex flex-col text-sm font-medium">
              Description:
              <input
                class="mt-1 border rounded bg-gray-100 p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                v-model="selectedSeat.description"
              />
            </label>
          </div>

          <div
            class="flex items-center mt-2 cursor-pointer group  pb-3"
            @click="selectedSeat.available = !selectedSeat.available"
          >
            <span class="mr-2 text-sm font-medium">Available:</span>
            <div
              class="w-5 h-5 border-2 rounded flex items-center justify-center transition-all"
              :class="
                selectedSeat.available
                  ? 'bg-green-500 border-green-600'
                  : 'bg-gray-400 border-gray-500'
              "
            >
              <svg
                v-if="selectedSeat.available"
                class="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-500 italic">
          Select a seat to edit details
        </div>

        <div
          v-if="!isViewingFloorPlan"
          class="grid grid-cols-3 gap-1.5 w-[140px] mx-auto lg:mx-0 shrink-0"
        >
          <button
            @click="moveSeat('upper-left')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇖
          </button>
          <button
            @click="moveSeat('up')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇑
          </button>
          <button
            @click="moveSeat('upper-right')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇗
          </button>
          <button
            @click="moveSeat('left')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇐
          </button>
          <button
            @click="moveSeat('rotation')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn bg-blue-600 hover:bg-blue-700"
          >
            ↺
          </button>
          <button
            @click="moveSeat('right')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇒
          </button>
          <button
            @click="moveSeat('lower-left')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇙
          </button>
          <button
            @click="moveSeat('down')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
          >
            ⇓
          </button>
          <button
            @click="moveSeat('lower-right')"
            :disabled="!selectedSeat || selectedSeat.locked"
            class="dpad-btn"
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
const viewportElement = ref(null);
const canvasWrapper = ref(null);

const selectedSeat = ref(null);
const seats = ref([]);
const hasExistingFloorPlan = ref(false);

const zoomLevel = ref(1);
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const scrollStart = ref({ x: 0, y: 0 });

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
  fabricCanvas.on("object:scaling", (e) => updateSeatScale(e.target));
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
      fabricCanvas.on("object:scaling", (e) => updateSeatScale(e.target));
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
            lockScalingX: seatData.locked ? true : (seatData.scaleX ? false : true),
            lockScalingY: seatData.locked ? true : (seatData.scaleY ? false : true),
            scaleX: seatData.scaleX || 1,
            scaleY: seatData.scaleY || 1,
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

// Pan functions
const startPan = (e) => {
  const allowPan = e.button === 1 || e.button === 2 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
  if (allowPan) {
    isPanning.value = true;
    panStart.value = { x: e.clientX, y: e.clientY };
    scrollStart.value = {
      x: viewportElement.value.scrollLeft,
      y: viewportElement.value.scrollTop
    };
    e.preventDefault();
  }
};

const onPan = (e) => {
  if (isPanning.value && viewportElement.value) {
    const deltaX = panStart.value.x - e.clientX;
    const deltaY = panStart.value.y - e.clientY;
    viewportElement.value.scrollLeft = scrollStart.value.x + deltaX;
    viewportElement.value.scrollTop = scrollStart.value.y + deltaY;
    e.preventDefault();
  }
};

const endPan = () => {
  isPanning.value = false;
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
    lockScalingX: false,
    lockScalingY: false,
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
    scaleX: seat.scaleX || 1,
    scaleY: seat.scaleY || 1,
    width: (seat.width || 0) * (seat.scaleX || 1),
    height: (seat.height || 0) * (seat.scaleY || 1),
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

const updateSeatScale = (target) => {
  const seatData = target.seatData;
  if (seatData) {
    seatData.scaleX = target.scaleX || 1;
    seatData.scaleY = target.scaleY || 1;
    try {
      seatData.width = (target.width || 0) * (target.scaleX || 1);
      seatData.height = (target.height || 0) * (target.scaleY || 1);
    } catch (e) {
      // ignore
    }
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
      lockScalingX: false,
      lockScalingY: false,
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
        scaleX: seat.scaleX || 1,
        scaleY: seat.scaleY || 1,
        width: (seat.width || 0) * (seat.scaleX || 1),
        height: (seat.height || 0) * (seat.scaleY || 1),
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

.canvas-wrapper {
  transition: transform 0.2s ease;
}

label {
  display: block;
  margin: 10px 0;
}

.btn-primary {
  @apply p-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium;
}
.btn-danger {
  @apply p-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 text-sm font-medium;
}
.btn-action {
  @apply p-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium;
}
.btn-save {
  @apply p-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium;
}

.dpad-btn {
  @apply aspect-square flex items-center justify-center bg-gray-600 text-white rounded-md 
         hover:bg-gray-700 active:scale-95 transition-all 
         disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-sm;
}

.btn-zoom {
  @apply p-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600;
}
</style>

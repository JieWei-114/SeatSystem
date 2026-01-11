<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold mb-4">Building Manage</h1>
    <div class="flex justify-between">
      <div
        v-if="isSuperAdmin"
        class="w-[40%] bg-gray-300 p-5 rounded-md max-h-[480px]"
      >
        <!-- Add Building (Super Admin only) -->
        <div class="mb-5">
          <h2 class="text-xl font-semibold mb-5">Add Building</h2>
          <form @submit.prevent="handleAddBuilding" class="space-y-2">
            <input
              v-model="buildingName"
              type="text"
              placeholder="Building Name"
              class="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              class="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Add Building
            </button>
          </form>
        </div>

        <!-- Add Floor (Super Admin only) -->
        <div v-if="isSuperAdmin" class="mb-4">
          <h2 class="text-xl font-semibold mb-4">Add Floor</h2>
          <form @submit.prevent="handleAddFloor" class="space-y-2">
            <select
              v-model="selectedBuildingId"
              class="w-full p-2 border rounded"
              required
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
            <input
              v-model="floorName"
              type="text"
              placeholder="Floor Name"
              class="w-full p-2 border rounded"
              required
            />
            <textarea
              v-model="floorDescription"
              placeholder="Floor Description"
              class="w-full p-2 border rounded resize-none"
              required
            ></textarea>
            <button
              type="submit"
              class="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Add Floor
            </button>
          </form>
        </div>
      </div>

      <!-- Manage Buildings and Floors -->
      <div
        class="mb-4 w-[58%] bg-gray-300 p-5 rounded-md"
        :class="{ 'w-full': !isSuperAdmin }"
      >
        <h2 class="text-xl mb-5 font-semibold">Buildings and Floors</h2>
        <div
          v-for="building in buildings"
          :key="building.id"
          class="mb-4 rounded-xl"
        >
          <div class="flex justify-between bg-white p-2">
            <input
              v-if="editingBuildingId === building.id"
              v-model="editedBuildingName"
              type="text"
              class="p-1 border rounded"
            />
            <span class="pl-1 text-lg" v-else>{{ building.name }}</span>
            <div class="space-x-2">
              <button
                v-if="editingBuildingId === building.id"
                @click="saveBuilding(building.id)"
                class="p-1 pl-4 pr-4 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                v-else
                @click="editBuilding(building)"
                class="p-1 pl-4 pr-4 bg-gray-500 text-white rounded"
              >
                Edit
              </button>
              <button
                @click="deleteBuildingConfirm(building.id)"
                class="p-1 pl-4 pr-4 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <div
            v-for="floor in building.floors"
            :key="floor.id"
            class="pl-6 flex justify-between bg-white p-2"
          >
            <div class="flex">
              <input
                v-if="editingFloorId === floor.id"
                v-model="editedFloorName"
                type="text"
                class="p-1 border rounded mr-2 w-[100px]"
              />
              <input
                v-if="editingFloorId === floor.id"
                v-model="editedFloorDescription"
                class="p-1 border rounded resize-none w-[250px]"
              />
              <span v-else>{{ floor.name }} - {{ floor.description }}</span>
            </div>
            <div class="space-x-2">
              <button
                v-if="editingFloorId === floor.id"
                @click="saveFloor(floor.id)"
                class="p-1 pl-4 pr-4 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                v-else
                @click="editFloor(floor)"
                class="p-1 pl-4 pr-4 bg-gray-500 text-white rounded"
              >
                Edit
              </button>
              <button
                @click="deleteFloorConfirm(floor.id)"
                class="p-1 pl-4 pr-4 bg-red-500 text-white rounded"
              >
                Delete
              </button>
              <button
                @click="openFloorPlanEditor(floor.id)"
                class="p-1 pl-4 pr-4 bg-purple-500 text-white rounded"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floor Plan Editor Modal for Editing -->
      <div
        v-if="showFloorPlanEditor"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
      >
        <div
          class="bg-white p-4 rounded-lg w-[82%] max-h-[90%] overflow-y-auto"
        >
          <floor-plan-editor
            :floor-id="selectedFloorId"
            :is-viewing-floor-plan="isViewingFloorPlan"
            @floor-plan-saved="onFloorPlanSaved"
          />
          <button
            @click="closeFloorPlanEditor"
            class="mt-2 p-1 pl-5 pr-5 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Add Floor Plan (Super Admin only) -->
    <div v-if="isSuperAdmin" class="mb-4 mt-10">
      <div class="p-5 rounded-md bg-gray-300 mb-5">
        <h2 class="text-xl font-semibold mb-5">Add Floor Plan</h2>
        <div class="space-y-2">
          <select
            v-model="selectedBuildingIdForFloorPlan"
            @change="updateFloorsForFloorPlan"
            class="w-full p-2 border rounded"
            required
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
          <select
            v-model="selectedFloorIdForFloorPlan"
            class="w-full p-2 border rounded"
            required
          >
            <option value="">Select Floor</option>
            <option
              v-for="floor in floorsForFloorPlan"
              :key="floor.id"
              :value="floor.id"
            >
              {{ floor.name }}
            </option>
          </select>
        </div>
      </div>
      <floor-plan-editor
        v-if="selectedFloorIdForFloorPlan"
        :key="selectedFloorIdForFloorPlan"
        :floor-id="selectedFloorIdForFloorPlan"
        @floor-plan-saved="onFloorPlanSavedForAdd"
      />
    </div>

    <p
      class="mt-2 p-1"
      :class="{ 'text-red-500': error, 'text-green-500': !error }"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  addBuilding,
  addFloor,
  updateBuilding,
  updateFloor,
  deleteBuilding,
  deleteFloor,
  getBuildingsAndFloors,
} from "../../services/api";
import FloorPlanEditor from "../../components/floorPlanEditor.vue";

interface FloorPlan {
  id: number;
  floorId: number;
  imagePath: string;
  seats?: any[];
}

const authStore = useAuthStore();
const buildingName = ref("");
const floorName = ref("");
const floorDescription = ref("");
const selectedBuildingId = ref<number | string>("");
const selectedBuildingIdForFloorPlan = ref<number | string>("");
const selectedFloorIdForFloorPlan = ref<number | string>("");
const floorsForFloorPlan = ref<any[]>([]);
const buildings = ref<any[]>([]);
const message = ref("");
const error = ref(false);
const editingBuildingId = ref<number | null>(null);
const editedBuildingName = ref("");
const editingFloorId = ref<number | null>(null);
const editedFloorName = ref("");
const editedFloorDescription = ref("");
const showFloorPlanEditor = ref(false);
const selectedFloorId = ref(0);
const isViewingFloorPlan = ref(false);

const router = useRouter();
const isSuperAdmin = computed(() => authStore.user?.role === "super_admin");

onMounted(() => {
  if (
    !authStore.isAuthenticated ||
    !["super_admin", "facility_manager"].includes(authStore.user?.role || "")
  ) {
    router.push("/booking");
  } else {
    fetchBuildings();
  }
});

const fetchBuildings = async () => {
  try {
    const data = await getBuildingsAndFloors();
    buildings.value = data.data;
  } catch (err: any) {
    message.value = err.response?.data?.message || "Failed to fetch buildings";
    error.value = true;
  }
};

const handleAddBuilding = async () => {
  try {
    const data = await addBuilding(buildingName.value);
    message.value = data.message;
    error.value = false;
    buildingName.value = "";
    fetchBuildings();
  } catch (err: any) {
    message.value = err.response?.data?.message || "Failed to add building";
    error.value = true;
  }
};

const handleAddFloor = async () => {
  try {
    const data = await addFloor(
      Number(selectedBuildingId.value),
      floorName.value,
      floorDescription.value
    );
    message.value = data.message;
    error.value = false;
    floorName.value = "";
    floorDescription.value = "";
    selectedBuildingId.value = "";
    fetchBuildings();
  } catch (err: any) {
    message.value = err.response?.data?.message || "Failed to add floor";
    error.value = true;
  }
};

const updateFloorsForFloorPlan = () => {
  const building = buildings.value.find(
    (b) => b.id === Number(selectedBuildingIdForFloorPlan.value)
  );
  floorsForFloorPlan.value = building ? building.floors : [];
  selectedFloorIdForFloorPlan.value = ""; // Reset floor selection
};

const editBuilding = (building: any) => {
  editingBuildingId.value = building.id;
  editedBuildingName.value = building.name;
};

const saveBuilding = async (buildingId: number) => {
  try {
    const data = await updateBuilding(buildingId, editedBuildingName.value);
    message.value = data.message;
    error.value = false;
    editingBuildingId.value = null;
    fetchBuildings();
  } catch (err: any) {
    message.value = err.response?.data?.message || "Failed to update building";
    error.value = true;
  }
};

const deleteBuildingConfirm = async (buildingId: number) => {
  if (confirm("Are you sure you want to delete this building?")) {
    try {
      const data = await deleteBuilding(buildingId);
      message.value = data.message;
      error.value = false;
      fetchBuildings();
    } catch (err: any) {
      message.value =
        err.response?.data?.message || "Failed to delete building";
      error.value = true;
    }
  }
};

const editFloor = (floor: any) => {
  editingFloorId.value = floor.id;
  editedFloorName.value = floor.name;
  editedFloorDescription.value = floor.description;
};

const saveFloor = async (floorId: number) => {
  try {
    const data = await updateFloor(
      floorId,
      editedFloorName.value,
      editedFloorDescription.value
    );
    message.value = data.message;
    error.value = false;
    editingFloorId.value = null;
    fetchBuildings();
  } catch (err: any) {
    message.value = err.response?.data?.message || "Failed to update floor";
    error.value = true;
  }
};

const deleteFloorConfirm = async (floorId: number) => {
  if (confirm("Are you sure you want to delete this floor?")) {
    try {
      const data = await deleteFloor(floorId);
      message.value = data.message;
      error.value = false;
      fetchBuildings();
    } catch (err: any) {
      message.value = err.response?.data?.message || "Failed to delete floor";
      error.value = true;
    }
  }
};

const openFloorPlanEditor = (floorId: number) => {
  selectedFloorId.value = floorId;
  showFloorPlanEditor.value = true;
  isViewingFloorPlan.value = true;
};

const closeFloorPlanEditor = () => {
  showFloorPlanEditor.value = false;
  isViewingFloorPlan.value = false;
};

const onFloorPlanSaved = (floorPlan: FloorPlan) => {
  console.log("Floor plan saved for editing:", floorPlan);
  showFloorPlanEditor.value = false;
  fetchBuildings();
};

const onFloorPlanSavedForAdd = (floorPlan: FloorPlan) => {
  console.log("Floor plan saved for adding:", floorPlan);
  message.value = "Floor plan added successfully!";
  error.value = false;
  selectedBuildingIdForFloorPlan.value = "";
  selectedFloorIdForFloorPlan.value = "";
  fetchBuildings();
};
</script>

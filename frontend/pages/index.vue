<template>
  <div class="min-h-screen min-w-full relative">
    <div class="absolute top-[40%] left-[20%] right-[20%]">
      <div id="load" class="flex justify-center">
        <h1 class="text-2xl pb-4">
          We’re working hard behind the scenes 
        </h1>
      </div>
      <div class="flex justify-center">
        <div id="progressbar" class="flex items-center">
          <span id="loading"></span>
        </div>
      </div>
      <div class="flex justify-center">
        <h1 class="text-2xl pt-4 ">
          Just a little patience - We get everything ready for you
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const countdown = ref(6);

onMounted(() => {
  const interval = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--; // Decrease countdown
    } else {
      clearInterval(interval);
      router.push("/login"); // Redirect after countdown ends
    }
  }, 1000); // Decrease every 1 second
});
</script>

<style scoped>
body {
  color: #333;
}
#progressbar {
  height: 30px;
  width: 100%;
  background: rgba(159, 159, 159, 0.5);
  border-radius: 10px;
  padding: 2px;
}
#loading {
  transition: all 500ms ease;
  height: 20px;
  width: calc(100% - 10px);
  border-radius: 8px;
  background: #474747;
  margin: 3px;
  display: inline-block;
  animation: load 8s ease infinite;
}
#load {
  font-family: Arial;
  font-weight: bold;
}

@keyframes load {
  0% {
    width: 2%;
  }
  10% {
    width: 10%;
  }
}
</style>

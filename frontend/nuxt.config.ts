import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-13',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5000/api', // Backend URL
    },
  },
  css: ['~/assets/css/tailwind.css'],
})

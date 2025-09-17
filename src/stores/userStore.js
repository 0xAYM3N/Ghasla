import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    role: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user
  },

  actions: {
    async fetchUser() {
      try {
        const res = await axios.get('/api/profile', { withCredentials: true })
        this.user = res.data.user
        this.role = res.data.role
      } catch (err) {
        console.error('fetchUser error:', err)
        this.user = null
        this.role = null
      }
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, { withCredentials: true })
      } catch (err) {
        console.error('logout error:', err)
      } finally {
        this.user = null
        this.role = null
      }
    }
  }
})


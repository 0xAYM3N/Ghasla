import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null,
    role: null,
    balance: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.userId
  },

  actions: {
    async fetchUser() {
      try {
        const res = await axios.get('/api/profile', { withCredentials: true })
        this.userId = res.data.user.id
        this.role = res.data.user.role
        this.balance = res.data.user.balance
      } catch (err) {
        console.error('fetchUser error:', err)
        this.userId = null
        this.role = null
        this.balance = null
      }
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, { withCredentials: true })
      } catch (err) {
        console.error('logout error:', err)
      } finally {
        this.userId = null
        this.role = null
        this.balance = null
      }
    }
  }
})

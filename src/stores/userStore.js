// stores/userStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async fetchUserData() {
      if (!this.token) return

      try {
        const res = await axios.get('http://localhost:3000/users', {
          headers: { Authorization: `Bearer ${this.token}` }
        })

        if (!res.data || !res.data.length) throw new Error('No user found')
        this.user = res.data[0]
      } catch (err) {
        console.error('❌ Failed to fetch user:', err)
      }
    }
  }
})


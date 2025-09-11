import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    role: null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async fetchUser() {
      if (!this.token) return

      try {
        const res = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        if (!res.ok) throw new Error('فشل جلب بيانات المستخدم')

        const data = await res.json()
        this.user = data
        this.role = data.role || null 
      } catch (err) {
        console.error('fetchUser error:', err)
        this.user = null
        this.role = null
      }
    },

    async setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      await this.fetchUser() 
    },

    async loadToken() {
      this.token = localStorage.getItem('token')
      if (this.token) {
        await this.fetchUser()
      }
    },

    logout() {
      this.token = null
      this.role = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})


import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    profile: null,
    role: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user
  },

  actions: {
    async fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('fetchUser error:', error.message)
        this.user = null
        return null
      }
      this.user = user
      return user
    },

    async fetchProfile() {
      if (!this.user) await this.fetchUser()
      if (!this.user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()

      if (error) {
        console.error('fetchProfile error:', error.message)
        this.profile = null
        return null
      }

      this.profile = data
      this.role = data?.role || 'user'
      return data
    },

    async loadUserSession() {
      const user = await this.fetchUser()
      if (user) {
        await this.fetchProfile()
      }
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
      this.role = null
    }
  }
})

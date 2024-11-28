import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    async login(loginForm) {
      try {
        // 模拟登录成功
        const data = {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            username: loginForm.username,
            role: 'admin'
          }
        }
        
        this.token = data.token
        this.userInfo = data.userInfo
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        
        return data
      } catch (error) {
        throw new Error('登录失败')
      }
    },
    
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
}) 
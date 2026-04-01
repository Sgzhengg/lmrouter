import axios from 'axios'
import type { ChatRequest, ChatResponse, ModelsResponse } from '../types'

// API 配置
const getApiBase = () => {
  // 生产环境从环境变量读取，开发环境指向后端服务器
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || ''
  }
  // 开发环境：明确使用IPv4地址避免与管理后台冲突
  return 'http://127.0.0.1:3002'
}

const API_BASE = `${getApiBase()}/openai/v1`
const MODELS_BASE = `${getApiBase()}/v1`
const API_KEY = 'sk-test-key-1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
})

export const apiClient = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/completions', request)
    return response.data
  },

  async getModels(): Promise<ModelsResponse> {
    const response = await api.get<ModelsResponse>('/models')
    return response.data
  },
}

export const modelsApi = axios.create({
  baseURL: MODELS_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
})

export const modelsClient = {
  async getModels(): Promise<ModelsResponse> {
    const response = await modelsApi.get<ModelsResponse>('/models')
    return response.data
  },
}

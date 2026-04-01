export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  model: string
  messages: Message[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface ChatChoice {
  index: number
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatChoice[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ModelProvider {
  provider: string
  model: string
}

export interface Model {
  id: string
  providers: ModelProvider[]
}

export interface ModelsResponse {
  models: Model[]
}

export interface ApiKey {
  id: string
  key: string
  name: string
  createdAt: string
  lastUsed?: string
}

export interface UsageData {
  date: string
  requests: number
  tokens: number
}

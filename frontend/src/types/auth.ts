export interface User {
  id: string
  username: string
  email: string
  bio: string
  created_at: string
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirm: string
}

export interface LoginPayload {
  username_or_email: string
  password: string
}

export interface UpdateProfilePayload {
  email?: string
  bio?: string
  current_password?: string
  new_password?: string
}


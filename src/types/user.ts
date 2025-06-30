export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  password: string
  roles: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateUserDto = Omit<
  User,
  'id' | '_id' | 'isActive' | 'createdAt' | 'updatedAt'
>

export type UpdateUserDto = Partial<CreateUserDto>

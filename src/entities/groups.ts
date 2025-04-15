import { YouOweEntity } from '@/entities/entity'

export const TABLE_NAME = 'groups'

export interface Groups extends YouOweEntity {
  name: string
  password?: string | null
  creator_member_id: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  is_closed: boolean
}

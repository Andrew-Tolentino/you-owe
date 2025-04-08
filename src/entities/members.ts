import { YouOweEntity } from '@/entities/entity';

export const TABLE_NAME = 'members'

export interface Members extends YouOweEntity {
  name: string
  created_at: Date
  deleted_at: Date | null
  auth_user_id: string
}

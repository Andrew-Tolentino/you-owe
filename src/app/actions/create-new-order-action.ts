"use server"

import { revalidatePath } from 'next/cache'

import { createNewOrderAction } from '@/actions/create-new-order-action'
import { NewOrderDTO } from '@/api/dtos/NewOrderDTO'
import { ServerActionResults } from '@/types/promise-results-types'
import { Order } from '@/entities/order'

/**
 * Server Action that creates an Order.
 * 
 * @param {NewOrderDTO} newOrderDTO
 * 
 * @returns {Promise<ServerActionResults<Order>>} ServerActionResults containing the new Order in payload if successful
 */
export async function createOrderServerAction(newOrderDTO: NewOrderDTO): Promise<ServerActionResults<Order>> {
  const result = await createNewOrderAction(newOrderDTO)
  if (result.success) {
    revalidatePath('/', 'layout')
  }

  return result
}

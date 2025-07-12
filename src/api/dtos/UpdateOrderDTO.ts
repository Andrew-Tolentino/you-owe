/** Mapping of fields within an Order that can be updated. */
interface UpdateOrderDTO {
  id: string

  title?: string

  description?: string

  price?: number
}

export { type UpdateOrderDTO }

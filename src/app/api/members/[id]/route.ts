import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'
import { SupabaseDBClient } from '@/db/supabase-client'
import { TABLE_NAME } from '@/entities/members'

/**
 * HTTP GET method to retrieve a Member a Member ID. 
 * @param {Request} _request 
 * @param {Object} params - Destructuring of an Object that contains the ID dynamic routing in a "params" key
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  /**
   * The parameter - "{ params }: { params: Promise<{ id: string }> }" confuses me a bit.
   * So I am going to write down what this means to me for future uses.
   * 
   * For our second parameter, we are expecting an Object argument such as { ... params: Promise<{ id: string }> }
   * where the value is a Promise that resolves into another object like { id: string }.
   */
  
  const { id } = await params

  // Fetch Members entity with given ID
  const db = new SupabaseDBClient()
  const member = await db.getEntityById(TABLE_NAME, id)
  if (member === null) {
    return Response.json({ error: `Member with ID '${id}' could not be found.` }, { status: HTTP_CODES.NOT_FOUND })
  }

  return Response.json(member, { status: HTTP_CODES.OK })
}

import { NewMemberDTO, validateNewMemberDTO } from '@/api/dtos/NewMemberDTO'
import { HTTP_CODES } from '@/api/utils/HTTPStatusCodes'

export async function POST(request: Request) {
  const requestBody: NewMemberDTO = await request.json()
  const error = validateNewMemberDTO(requestBody)
  if (error !== null) {
    return Response.json({ error }, { status: HTTP_CODES.BAD_REQUEST })
  }

  return Response.json(requestBody)
}

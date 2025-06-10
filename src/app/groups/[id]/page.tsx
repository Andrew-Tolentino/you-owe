import DisplayOrdersGrid from '@/components/DisplayOrdersGrid'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  /**
   * TODO:
   *  1. Detect if user is in session
   *  2. Load up group based on ID
   *  3. Display Group Information for now
   */

  return (
    <DisplayOrdersGrid groupId={id} />
  )
}

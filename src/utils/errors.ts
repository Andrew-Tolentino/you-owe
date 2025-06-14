
/**
 * An Error inherited class that is used to redirect User to ErrorBoundary components on the client.
 * This is incase some error occurs on the server side in server components/actions.
 */
class WebError extends Error {

}
export { WebError }

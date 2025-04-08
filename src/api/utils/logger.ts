import Pino, { Logger as PinoLogger } from 'pino'
import PinoPretty from 'pino-pretty'

let Logger = null
if (process.env.ENV !== 'production') {
  const stream = PinoPretty({ colorize: true })
  Logger = Pino(stream)
} else {
  Logger = Pino()
}

export default Logger as PinoLogger

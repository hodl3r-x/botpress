import { Types } from 'whatsapp-api-js'
import { IntegrationLogger } from '..'
import * as body from '../interactive/body'
import * as button from '../interactive/button'
import { chunkArray } from '../util'
import type { channels } from '.botpress'

const { Text } = Types
const { Interactive, ActionButtons } = Types.Interactive

type Choice = channels.Channels['channel']['choice']
type Option = Choice['options'][number]

const INTERACTIVE_MAX_BUTTONS_COUNT = 3

export function* generateOutgoingMessages({
  payload: { text, options },
  logger,
}: {
  payload: Choice
  logger: IntegrationLogger
}) {
  if (options.length === 0) {
    yield new Text(text)
  } else {
    const chunks = chunkArray(options, INTERACTIVE_MAX_BUTTONS_COUNT)

    if (options.length > INTERACTIVE_MAX_BUTTONS_COUNT) {
      logger
        .forBot()
        .info(
          `Splitting ${options.length} choices into groups of ${INTERACTIVE_MAX_BUTTONS_COUNT} buttons each due to a limitation of Whatsapp.`
        )
    }

    for (const chunk of chunks) {
      yield new Interactive(new ActionButtons(...chunk.map(createButton)), body.create(text))
    }
  }
}

function createButton(option: Option) {
  return button.create({ id: option.value, title: option.label })
}

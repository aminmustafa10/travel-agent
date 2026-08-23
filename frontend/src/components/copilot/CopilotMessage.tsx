import type { CopilotMessage as CopilotMessageType } from '../../types/copilot'

type CopilotMessageProps = {
  message: CopilotMessageType
}

export function CopilotMessage({ message }: CopilotMessageProps) {
  const author = message.role === 'assistant' ? 'Travel Agent AI' : 'Você'

  return (
    <article
      className={`copilot-message copilot-message--${message.role}${message.isError ? ' copilot-message--error' : ''}`}
    >
      <span className="copilot-message__author">{author}</span>
      <p>{message.content}</p>
    </article>
  )
}

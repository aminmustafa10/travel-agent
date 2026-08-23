import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { sendCopilotMessage } from '../../services/copilot.service'
import type {
  CopilotContext,
  CopilotMessage as CopilotMessageType,
} from '../../types/copilot'
import { CopilotMessage } from './CopilotMessage'

type CopilotPanelProps = {
  context: CopilotContext
  isOpen: boolean
  onClose: () => void
}

const initialMessage: CopilotMessageType = {
  id: 'copilot-welcome',
  role: 'assistant',
  content:
    'Olá! Posso ajudar você a entender sua viagem, seus gastos e seu planejamento.',
}

const suggestions = [
  'Como estão meus gastos?',
  'Quanto ainda posso gastar?',
  'Explique meus alertas.',
] as const

export function CopilotPanel({
  context,
  isOpen,
  onClose,
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessageType[]>([
    initialMessage,
  ])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messageSequence = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [isOpen, messages])

  function createMessageId(role: CopilotMessageType['role']): string {
    messageSequence.current += 1
    return `copilot-${role}-${messageSequence.current}`
  }

  async function sendMessage() {
    const message = draft.trim()

    if (!message || isSending) {
      return
    }

    const userMessage: CopilotMessageType = {
      id: createMessageId('user'),
      role: 'user',
      content: message,
    }

    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsSending(true)

    try {
      const response = await sendCopilotMessage({ message, context })

      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: response.message,
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: 'Não consegui falar com o assistente agora. Tente novamente.',
          isError: true,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <aside
      className="copilot-panel"
      id="copilot-panel"
      aria-label="Travel Agent AI"
      hidden={!isOpen}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <header className="copilot-panel__header">
        <div className="copilot-panel__identity">
          <span className="copilot-panel__mark" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>Travel Agent AI</strong>
            <span>Seu assistente de viagem</span>
          </div>
        </div>
        <button
          className="copilot-panel__close"
          type="button"
          onClick={onClose}
          aria-label="Fechar assistente"
        >
          ×
        </button>
      </header>

      <div className="copilot-panel__mode">
        <span aria-hidden="true">●</span>
        Modo foundation — modelo ainda não conectado
      </div>

      <div className="copilot-messages" role="log" aria-live="polite">
        {messages.map((message) => (
          <CopilotMessage message={message} key={message.id} />
        ))}

        {isSending ? (
          <div className="copilot-typing" role="status">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span className="sr-only">O assistente está respondendo.</span>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="copilot-suggestions" aria-label="Sugestões de perguntas">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            onClick={() => {
              setDraft(suggestion)
              textareaRef.current?.focus()
            }}
            disabled={isSending}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form className="copilot-composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="copilot-message-input">
          Mensagem para o assistente
        </label>
        <textarea
          id="copilot-message-input"
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre sua viagem..."
          rows={3}
          maxLength={2000}
          disabled={isSending}
        />
        <div className="copilot-composer__footer">
          <span>Enter envia · Shift + Enter quebra linha</span>
          <button type="submit" disabled={!draft.trim() || isSending}>
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </aside>
  )
}

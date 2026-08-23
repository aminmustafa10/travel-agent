type CopilotButtonProps = {
  onOpen: () => void
}

export function CopilotButton({ onOpen }: CopilotButtonProps) {
  return (
    <button
      className="copilot-launcher"
      type="button"
      onClick={onOpen}
      aria-controls="copilot-panel"
      aria-expanded="false"
    >
      <span className="copilot-launcher__icon" aria-hidden="true">
        ✦
      </span>
      <span>AI Copilot</span>
    </button>
  )
}

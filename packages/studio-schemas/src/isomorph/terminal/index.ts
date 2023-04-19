export interface TerminalRunContext {
  cwd: string
  hang?: boolean
  sideEffect?: {
    clear?: boolean
  }
  hangDetails?: {
    queryString?: string | null
    command?: string
  }
}

export interface TerminalRunParams {
  rawCommand: string
  context: TerminalRunContext
}

export interface TerminalRunResponse {
  resText: string
  context: TerminalRunContext
}

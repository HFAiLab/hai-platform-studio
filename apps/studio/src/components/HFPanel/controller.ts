class PanelController {
  enterLoadingPanels: Set<string> = new Set()

  addEnterLoadingPanel(panelName: string) {
    console.info('addEnterLoadingPanel:', panelName)
    this.enterLoadingPanels.add(panelName)
  }

  removeEnterLoadingPanel(panelName: string) {
    this.enterLoadingPanels.delete(panelName)
  }

  hasEnterLoadingPanel(panelName: string) {
    return this.enterLoadingPanels.has(panelName)
  }
}

export const GlobalPanelController = new PanelController()

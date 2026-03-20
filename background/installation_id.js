// Installation ID management for unique user identification
// Uses Chrome sync storage to persist across uninstall/reinstall on same profile
// InstallationIdManager - Local Storage Only (Refactored for Security)
export class InstallationIdManager {
  static async getUniqueInstallationId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['uniqueInstallationId'], (result) => {
        if (result.uniqueInstallationId) {
          resolve(result.uniqueInstallationId);
          return;
        }

        const uniqueId = this.generateUniqueId();
        chrome.storage.local.set({ uniqueInstallationId: uniqueId }, () => {
          resolve(uniqueId);
        });
      });
    });
  }

  static generateUniqueId() {
    return `local_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

class ChromePageAction {
  /**
   * Creates an instance of ChromePageAction.
   * @param {number} tabId - default tab id for methods 
   * @memberof ChromePageAction
   */
  constructor(tabId) {
    this.tabId = tabId
  }

  /**
   * Sets the title of the page action. This is displayed in a tooltip over the page action.
   * 
   * @param {string} title - The tooltip string. 
   * @memberof ChromePageAction
   */
  setTitle(title) {
    chrome.pageAction.setTitle({
      tabId: this.tabId,
      title: title,
    })
  }

  /**
   * @typedef {Object} IconDetails
   * @prop {number} [tabId] - (override) The id of the tab for which you want to modify the page action.
   * @prop {Object} [imageData] - Either an ImageData object or a dictionary {size -> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
   * @prop {string|Object} [path] - Either a relative image path or a dictionary {size -> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
   */

  /**
   * Sets the icon for the page action. The icon can be specified either as the path to an image file or as the pixel 
   * data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.
   * 
   * @param {IconDetails} details 
   * @returns {Promise}
   * @memberof ChromePageAction
   */
  setIcon(details) {
    return new Promise(resolve => {
      chrome.pageAction.setIcon(Object.assign({tabId: this.tabId}, details), () => resolve())
    })
  }

  /**
   * Shows the page action. The page action is shown whenever the tab is selected
   * 
   * @memberof ChromePageAction
   */
  show() {
    chrome.pageAction.show(this.tabId)
  }
}
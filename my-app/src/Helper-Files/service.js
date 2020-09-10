/** eventsService */
export default {
  callbacks: {},

  createEvent(eventName) {
      if (typeof eventName !== 'string') throw ('(invalid params) Check service params for ' + eventName);
    this.callbacks[eventName] = {};
  },

  /**
   * @param {string} eventName
   * @param {*} data
   */
  triggerEvent(eventName, data = null) {
      if (typeof eventName !== 'string') throw ('(invalid params) Check service params for ' + eventName);
    if (this.callbacks[eventName] != null) {
      Object.keys(this.callbacks[eventName]).forEach(id => {
        this.callbacks[eventName][id](data);
      });
    }
  },

  /**
   * @param {string} eventName name of event
   * @param {string} id callback identifier
   * @param {Function} callback
   */
  listenEventWithId(eventName, id, callback) {
     if (typeof eventName !== 'string' || typeof id !== 'string' || typeof callback !== 'function') throw ('(invalid params) Check service params for ' + eventName);
    if (this.callbacks[eventName] != null) this.callbacks[eventName][id] = callback;
    // console.log(this.callbacks[eventName][id])
  },
  /**
   * NOTE: first available callback is taken
   * @param {string} eventName name of event
   * @param {Function} callback
   */
  listenEvent(eventName, callback) {
      if (typeof eventName !== 'string' || typeof callback !== 'function') throw ('(invalid params) Check service params for ' + eventName);
    if (this.callbacks[eventName] != null) {
        var firstKey = 'key1'; //Object.keys(this.callbacks[eventName])[0];
        this.callbacks[eventName][firstKey] = callback;
    } else console.log('Issue: Cannot listen to event that hasnt been initialized');
  },

  /**
   * @param {string} eventName name of event
   * @param {string} id callback identifier
   */
  unlistenEvent(eventName, id) {
    if (this.callbacks[eventName] != null) delete this.callbacks[eventName][id];
  },
  /**
   * @param {string} eventName name of event
   */
  unlistenEvent(eventName) {
    if (this.callbacks[eventName] != null) delete this.callbacks[eventName];
  }
};

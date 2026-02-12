/** Event bus for cross-component communication */
export default {
  callbacks: {},

  createEvent(eventName) {
    if (typeof eventName !== 'string') throw new Error('Check service params for ' + eventName);
    this.callbacks[eventName] = {};
  },

  triggerEvent(eventName, data = null) {
    if (typeof eventName !== 'string') throw new Error('Check service params for ' + eventName);
    if (this.callbacks[eventName] != null) {
      Object.keys(this.callbacks[eventName]).forEach((id) => {
        this.callbacks[eventName][id](data);
      });
    }
  },

  listenEventWithId(eventName, id, callback) {
    if (typeof eventName !== 'string' || typeof id !== 'string' || typeof callback !== 'function') {
      throw new Error('Check service params for ' + eventName);
    }
    if (this.callbacks[eventName] != null) {
      this.callbacks[eventName][id] = callback;
    }
  },

  listenEvent(eventName, callback) {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      throw new Error('Check service params for ' + eventName);
    }
    if (this.callbacks[eventName] != null) {
      this.callbacks[eventName]['key1'] = callback;
    } else {
      console.log('Issue: Cannot listen to event that hasn\'t been initialized');
    }
  },

  unlistenEventById(eventName, id) {
    if (this.callbacks[eventName] != null) delete this.callbacks[eventName][id];
  },

  unlistenEvent(eventName) {
    if (this.callbacks[eventName] != null) delete this.callbacks[eventName];
  }
};

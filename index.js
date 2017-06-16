const xs = require('xstream').default

var data = new WeakMap()

/* --- track --- */

module.exports.track = track

var eventStreams = {}
eventStreams['__global__'] = eventStreams['__global__'] || xs.create()

function track (e) {
  e.preventDefault()
  eventStreams['__global__'].shamefullySendNext({e})
}

track.withData = function (data) {
  return (e) => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, data})
  }
}

track.tag = function (name, data) {
  let eventStream = eventStreams[name] || xs.create()
  eventStreams[name] = eventStream
  return e => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, data})
    eventStream.shamefullySendNext({e, data})
  }
}

var anyStreams = {}
track.any = function (name, data) {
  let anyStream = anyStreams[name] || xs.create()
  anyStreams[name] = anyStream
}


/* --- listen --- */

module.exports.listen = listen

function listen (selector, eventType, tag = '__global__') {
  let ee = eventStreams[tag] || xs.create()
  eventStreams[tag] = ee

  ee = ee
    .filter(meta =>
      matchesSelector(meta.e.currentTarget, selector)
    )
    .filter(meta => meta.e.type === eventType || eventType === '*' || !eventType)
    .map(meta => {
      let nativeEvent = meta.e.nativeEvent || meta.e
      data.set(nativeEvent, meta.data)
      meta.e.data = () => data.get(nativeEvent)
      return meta.e
    })

  return ee
}

listen.any = function listenAny (name) {
  let anyStream = anyStreams[name] || xs.create()
  anyStreams[name] = anyStream
  return anyStream
}

var matchesSelector
if (typeof window !== 'undefined') {
  const proto = window.Element.prototype
  const vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector
  matchesSelector = function (elem, selector) {
    return vendor.call(elem, selector)
  }
} else {
  matchesSelector = function () { return false }
}

/* --- */

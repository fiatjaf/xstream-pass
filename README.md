xstream-pass is mostly useful for tracking React events.

```jsx
const {track, listen} = require('xstream-pass')

// React component:
<input className="name" onChange={track}>

// handler somewhere:
listen('input.name', 'change')
  .map(e => e.target.value)
```

For more information, please read the source.

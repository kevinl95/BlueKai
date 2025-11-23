import { h } from 'preact';

function App() {
  return (
    h('div', { style: { padding: '20px', textAlign: 'center' } },
      h('h1', null, 'BlueKai'),
      h('p', null, 'BlueSky client for KaiOS')
    )
  );
}

export default App;

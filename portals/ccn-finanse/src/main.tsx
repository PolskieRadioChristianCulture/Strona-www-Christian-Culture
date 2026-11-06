import { Component, type ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class NewsErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('CCN render failed:', error); }
  render() {
    if (this.state.failed) return <main style={{maxWidth: 540, margin: '3rem auto', padding: 24, fontFamily: 'system-ui'}}>
      <h1>CCN News</h1><p>Nie udało się wyświetlić wiadomości.</p>
      <button onClick={() => window.location.reload()}>Spróbuj ponownie</button>
      <p><a href="mailto:redakcjaccn@gmail.com">Zgłoś problem redakcji</a></p>
    </main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<NewsErrorBoundary><App /></NewsErrorBoundary>);


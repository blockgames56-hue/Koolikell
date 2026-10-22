import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-100 text-slate-800">
          <div className="p-8 max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">Произошла ошибка интерфейса</h2>
            <p className="text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 break-words text-left">
              {this.state.error?.message || 'Неизвестная ошибка'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-[#185d9e] text-white rounded-xl text-sm font-semibold hover:bg-[#154f86] transition-all cursor-pointer"
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElem = document.getElementById('root');
if (rootElem) {
  createRoot(rootElem).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

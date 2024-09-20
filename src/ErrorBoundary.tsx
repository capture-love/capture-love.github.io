import React, { ComponentType, ReactNode } from 'react';

type Props = {
  children: ReactNode,
};

type State = {
  hasError: boolean,
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // eslint-disable-next-line no-alert
    alert('Ups... došlo je do greške, pokušajte ponovo');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) return null;

    return this.props.children;
  }
}

export default ErrorBoundary as ComponentType<Props>;

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
    alert("Ups... došlo je do greške, pokušajte ponovo");
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }

  render() {
    if (this.state.hasError) return null

    return this.props.children;
  }
}

export default ErrorBoundary as ComponentType<Props>;
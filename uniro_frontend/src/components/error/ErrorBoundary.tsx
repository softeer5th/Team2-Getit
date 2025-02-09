import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    fallback: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<
    React.PropsWithChildren<ErrorBoundaryProps>,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren<ErrorBoundaryProps>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

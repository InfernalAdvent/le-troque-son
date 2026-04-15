import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Une erreur est survenue
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Veuillez rafraîchir la page ou réessayer plus tard.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.href = '/';
                        }}
                        className="bg-green-600 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

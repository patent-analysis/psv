import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import StringManager from '../utils/StringManager';
import { BrowserRouter as Router } from 'react-router-dom';

describe('App', () => {
    beforeEach(() => {
    // We require to include Router in our test rendering as react-router-dom Link components cannot exist without parent Router
        render(
            <Router>
                <App/>
            </Router>
        );
    });
    xtest('it shows a footer with our app and team description', () => {
        const link = screen.getByText(StringManager.get('appOwnershipFooter'));
        expect(link).toBeInTheDocument();
    });

    xtest('clicking on Search header link redirects to Search Page', () => {
        fireEvent.click(screen.getByText(StringManager.get('search')));
        const selectEpitopeButton = screen.getByText(StringManager.get('selectEpitope'));
        expect(selectEpitopeButton).toBeInTheDocument();
        expect(window.location.pathname).toEqual('/search');
    });

    xtest('clicking on Upload Patents header link redirects to Upload Patents Page', () => {
        fireEvent.click(screen.getByText(StringManager.get('uploadPatents')));
        expect(window.location.pathname).toEqual('/upload');
    });
});

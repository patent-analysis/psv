import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import PageRouter from './PageRouter';

describe('PageRouter', () => {
    xtest('does not crash', () => {
        render(
            <Router>
                <PageRouter/>    
            </Router>
        );
    });
});
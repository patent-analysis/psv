import { render } from '@testing-library/react';
import { BrowserRouter as Router } from "react-router-dom";
import PatentUpload from './PatentUpload';

describe('PatentUpload', () => {
    test('does not crash', () => {
        render(
            <Router>
                <PatentUpload/>    
            </Router>
        );
    });
});
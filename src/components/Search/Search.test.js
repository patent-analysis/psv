import { render } from '@testing-library/react';
import { BrowserRouter as Router } from "react-router-dom";
import Search from './Search';

describe('Search', () => {
    test('does not crash', () => {
        render(
            <Router>
                <Search/>    
            </Router>
        );
    });
});
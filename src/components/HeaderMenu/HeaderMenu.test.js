import { render, screen } from '@testing-library/react'
import HeaderMenu from './HeaderMenu';
import StringManager from '../../utils/StringManager';
import { BrowserRouter as Router } from 'react-router-dom';

describe('HeaderMenu', () => {
    test('upload patents and search links are rendered', () => {
        render(
            <Router>
                <HeaderMenu/>
            </Router>
        );
        const uploadPatentsLink = screen.getByText(StringManager.get('uploadPatents'));
        const searchLink = screen.getByText(StringManager.get('search'));
        expect(uploadPatentsLink).toBeInTheDocument();
        expect(searchLink).toBeInTheDocument();
    });
});
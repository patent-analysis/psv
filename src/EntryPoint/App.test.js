import { render, screen } from '@testing-library/react';
import App from './App';
import StringManager from '../utils/StringManager';

describe('App', () => {
  test('it shows a footer with our app and team description', () => {
    render(<App />);
    const link = screen.getByText(StringManager.get('appOwnershipFooter'));
    expect(link).toBeInTheDocument();
  });
});

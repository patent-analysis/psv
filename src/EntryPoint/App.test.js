import { render, screen } from '@testing-library/react';
import App from './App';
import StringManager from '../utils/StringManager';
import { BrowserRouter as Router } from "react-router-dom";

describe('App', () => {
  test('it shows a footer with our app and team description', () => {
    render(
      <Router>
        <App />
      </Router>);
    const link = screen.getByText(StringManager.get('appOwnershipFooter'));
    expect(link).toBeInTheDocument();
  });
});

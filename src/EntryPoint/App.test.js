import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import StringManager from '../utils/StringManager';
import { useLocation, BrowserRouter as Router } from "react-router-dom";

describe('App', () => {

  beforeEach(() => {
    // We require to include Router in our test rendering as react-router-dom Link components cannot exist without parent Router
    render(
      <Router>
        <App/>
      </Router>);
  });
  test('it shows a footer with our app and team description', () => {
    const link = screen.getByText(StringManager.get('appOwnershipFooter'));
    expect(link).toBeInTheDocument();
  });

  test('clicking on Search header redirects to Search Page', () => {
    fireEvent.click(screen.getByText(StringManager.get('search')));
    const selectEpitopeButton = screen.getByText(StringManager.get('selectEpitope'));
    expect(selectEpitopeButton).toBeInTheDocument();
    expect(window.location.pathname).toEqual('/search');
  });

  test('clicking on Search header redirects to Search Page', () => {
    fireEvent.click(screen.getByText(StringManager.get('uploadPatents')));
    expect(window.location.pathname).toEqual('/upload');
  });
});

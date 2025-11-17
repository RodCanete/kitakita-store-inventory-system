import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login header', () => {
  render(<App />);
  const header = screen.getByText(/log in to your account/i);
  expect(header).toBeInTheDocument();
});

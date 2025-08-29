import { render, screen } from '@testing-library/react';
import App from './App';

test('renders scan network button', () => {
  render(<App />);
  const scanButton = screen.getByText(/Escanear Rede/i);
  expect(scanButton).toBeInTheDocument();
});

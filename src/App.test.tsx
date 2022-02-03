import App from './App';
import { render, screen } from './tests/utils';

test('renders learn loading screen', () => {
  render(<App />);
  const waitingHeading = screen.getByText(/Waiting for Safe/i);
});

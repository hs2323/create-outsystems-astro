import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '../../../src/framework/react/Counter';

describe('Counter', () => {
  const defaultProps = {
    children: <div>Test Children</div>,
    header: <h1>Test Header</h1>,
    InitialCount: 5,
    ShowMessage: 'mockFunction',
  };

  beforeEach(() => {
    // Mock the document function
    (document as any).mockFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial count', () => {
    render(<Counter {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(<Counter {...defaultProps} />);
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

it('renders children', () => {
    render(<Counter {...defaultProps} />);
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('increments count when add button is clicked', () => {
    render(<Counter {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(addButton);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('decrements count when subtract button is clicked', () => {
    render(<Counter {...defaultProps} />);
    const subtractButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(subtractButton);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls the show message function', () => {
    render(<Counter {...defaultProps} />);
    const sendButton = screen.getByRole('button', { name: 'Send value' });
    fireEvent.click(sendButton);
    expect((document as any).mockFunction).toHaveBeenCalledWith(5);
  });

});

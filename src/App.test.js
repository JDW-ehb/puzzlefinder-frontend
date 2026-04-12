import { render, screen } from "@testing-library/react";
import App from './App';

jest.mock("./pages/ChatPage", () => () => <div>Chat Page</div>);
jest.mock("./pages/MapPage", () => () => <div>Map Page</div>);
jest.mock("./pages/ProgressPage", () => () => <div>Progress Page</div>);

test("renders PuzzleFinder shell", () => {
  render(<App />);
  expect(screen.getByText(/PuzzleFinder/i)).toBeInTheDocument();
  expect(screen.getByText(/Brussels quest board/i)).toBeInTheDocument();
});

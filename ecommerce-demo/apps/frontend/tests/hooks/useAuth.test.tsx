import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";

// Mock the API
vi.mock("@/lib/api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  },
}));

// Test component that uses the hook
function TestComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
      <div data-testid="user">{user ? user.email : "none"}</div>
      <button onClick={() => login({ email: "test@test.com", password: "password" })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Don't clear localStorage here since we want to set it up before tests
  });

  it("should throw error when used outside AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleError.mockRestore();
  });

  it("should start with unauthenticated state when no token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("should load user from stored token on mount", async () => {
    const mockUser = { id: "1", email: "stored@test.com", role: "CUSTOMER" as const };
    window.localStorage.setItem("token", "stored-token");
    vi.mocked(authApi.me).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("user")).toHaveTextContent("stored@test.com");
    expect(authApi.me).toHaveBeenCalled();
  });

  it("should clear token if user fetch fails", async () => {
    localStorage.setItem("token", "invalid-token");
    vi.mocked(authApi.me).mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should login successfully", async () => {
    const mockUser = { id: "1", email: "test@test.com", role: "CUSTOMER" as const };
    vi.mocked(authApi.login).mockResolvedValue({
      data: { user: mockUser, token: "new-token" },
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    await user.click(screen.getByText("Login"));

    await waitFor(
      () => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("user")).toHaveTextContent("test@test.com");
    expect(authApi.login).toHaveBeenCalledWith("test@test.com", "password");
  });

  it("should logout successfully", async () => {
    const mockUser = { id: "1", email: "test@test.com", role: "CUSTOMER" as const };
    window.localStorage.setItem("token", "test-token");
    vi.mocked(authApi.me).mockResolvedValue(mockUser);

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      },
      { timeout: 2000 }
    );

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    });

    expect(window.localStorage.getItem("token")).toBeNull();
  });
});

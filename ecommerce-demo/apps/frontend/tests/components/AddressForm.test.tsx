import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "@/components/checkout/AddressForm";
import type { Address } from "@/types";

const mockAddress: Address = {
  firstName: "John",
  lastName: "Doe",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  country: "US",
  phone: "",
};

describe("AddressForm", () => {
  it("should render all address fields", () => {
    const onChange = vi.fn();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Shipping Address")).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it("should display address values correctly", () => {
    const onChange = vi.fn();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("New York")).toBeInTheDocument();
    expect(screen.getByDisplayValue("NY")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("US")).toBeInTheDocument();
  });

  it("should call onChange when first name is changed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "X");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.firstName).toBe("JohnX");
  });

  it("should call onChange when street is changed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    const streetInput = screen.getByLabelText(/street address/i);
    await user.type(streetInput, "X");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.street).toBe("123 Main StX");
  });

  it("should call onChange when phone is changed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, "5");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.phone).toBe("5");
  });

  it("should disable all inputs when disabled prop is true", () => {
    const onChange = vi.fn();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
        disabled
      />
    );

    expect(screen.getByLabelText(/first name/i)).toBeDisabled();
    expect(screen.getByLabelText(/last name/i)).toBeDisabled();
    expect(screen.getByLabelText(/street address/i)).toBeDisabled();
    expect(screen.getByLabelText(/city/i)).toBeDisabled();
    expect(screen.getByLabelText(/state\/province/i)).toBeDisabled();
    expect(screen.getByLabelText(/postal code/i)).toBeDisabled();
    expect(screen.getByLabelText(/country/i)).toBeDisabled();
    expect(screen.getByLabelText(/phone number/i)).toBeDisabled();
  });

  it("should preserve other fields when one field is changed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AddressForm
        title="Shipping Address"
        address={mockAddress}
        onChange={onChange}
      />
    );

    const cityInput = screen.getByLabelText(/city/i);
    await user.type(cityInput, "X");

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.firstName).toBe("John");
    expect(lastCall.lastName).toBe("Doe");
    expect(lastCall.street).toBe("123 Main St");
    expect(lastCall.city).toBe("New YorkX");
    expect(lastCall.state).toBe("NY");
    expect(lastCall.postalCode).toBe("10001");
    expect(lastCall.country).toBe("US");
  });
});

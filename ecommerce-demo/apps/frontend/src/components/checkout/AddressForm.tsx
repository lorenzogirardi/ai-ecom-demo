"use client";

import type { Address } from "@/types";

interface AddressFormProps {
  title: string;
  address: Address;
  onChange: (address: Address) => void;
  disabled?: boolean;
}

export function AddressForm({
  title,
  address,
  onChange,
  disabled = false,
}: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${title}-firstName`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name *
          </label>
          <input
            type="text"
            id={`${title}-firstName`}
            className="input w-full"
            value={address.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`${title}-lastName`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name *
          </label>
          <input
            type="text"
            id={`${title}-lastName`}
            className="input w-full"
            value={address.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${title}-street`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Street Address *
        </label>
        <input
          type="text"
          id={`${title}-street`}
          className="input w-full"
          value={address.street}
          onChange={(e) => handleChange("street", e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${title}-city`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City *
          </label>
          <input
            type="text"
            id={`${title}-city`}
            className="input w-full"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`${title}-state`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            State/Province *
          </label>
          <input
            type="text"
            id={`${title}-state`}
            className="input w-full"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${title}-postalCode`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Postal Code *
          </label>
          <input
            type="text"
            id={`${title}-postalCode`}
            className="input w-full"
            value={address.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label
            htmlFor={`${title}-country`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country *
          </label>
          <input
            type="text"
            id={`${title}-country`}
            className="input w-full"
            value={address.country}
            onChange={(e) => handleChange("country", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${title}-phone`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id={`${title}-phone`}
          className="input w-full"
          value={address.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

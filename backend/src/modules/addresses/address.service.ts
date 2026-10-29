import { addressRepository } from "./address.repository.js";
import type { CreateAddressInput } from "./address.schemas.js";

type AddressRecord = Awaited<ReturnType<typeof addressRepository.findManyByUser>>[number];

// DTO público (contrato con el FRONTEND). La BD guarda los campos en español
// (direccion/municipio/…) y aquí se traducen a line1/city/…; el mapeo vive
// SOLO en este archivo para que el contrato no dependa del esquema.
export interface AddressDto {
  id: string;
  alias: string;
  receiverName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  department: string;
  postalCode: string | null;
  isDefault: boolean;
}

export function toAddressDto(address: AddressRecord): AddressDto {
  return {
    id: address.id,
    alias: address.alias,
    receiverName: address.recipient,
    phone: address.phone,
    line1: address.direccion,
    line2: address.apartamento,
    city: address.municipio,
    department: address.departamento,
    postalCode: address.codigoPostal,
    isDefault: address.isDefault,
  };
}

// Lógica de negocio de direcciones de envío.
export const addressService = {
  async list(userId: string) {
    const addresses = await addressRepository.findManyByUser(userId);
    return addresses.map(toAddressDto);
  },

  async create(userId: string, input: CreateAddressInput) {
    // La primera dirección del usuario siempre queda como predeterminada.
    const isDefault = input.isDefault || (await addressRepository.countByUser(userId)) === 0;
    if (isDefault) await addressRepository.clearDefault(userId);

    const created = await addressRepository.create(userId, input, isDefault);
    return toAddressDto(created);
  },
};

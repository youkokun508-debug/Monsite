'use client';

import { createContext, useContext } from 'react';

export const RestaurantPhoneContext = createContext('01 43 76 05 70');

export function PhoneLink({ className = 'btn btn-primary', showNumber = false }: { className?: string; showNumber?: boolean }) {
  const phone = useContext(RestaurantPhoneContext);
  return (
    <a className={className} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
      {showNumber ? `Appeler le ${phone}` : 'Réserver par téléphone'}
    </a>
  );
}

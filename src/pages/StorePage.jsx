import React from 'react';
import Store from '../components/Store';

export default function StorePage() {
  // La tienda siempre está "abierta" en esta página
  return <Store isOpen={true} onClose={() => window.history.back()} />;
}

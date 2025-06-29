import React from 'react';
export default function SupplierMap({ suppliers }: { suppliers: any[] }) {
  return (
    <div>
      <h3>Suppliers</h3>
      <ul>
        {suppliers.map((s, i) => <li key={i}>{s.name} – {s.location}</li>)}
      </ul>
    </div>
  );
}

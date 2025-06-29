import React from 'react';
export default function CostSummary({ cost }: any) {
  return (
    <div>
      <h3>Cost Estimate</h3>
      <p>Total: ₹{cost?.total}</p>
    </div>
  );
}

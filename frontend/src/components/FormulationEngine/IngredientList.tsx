import React from 'react';
export default function IngredientList({ ingredients }: { ingredients: any[] }) {
  return (
    <div>
      <h3>Ingredients</h3>
      <ul>
        {ingredients.map((ing, i) => <li key={i}>{ing.name}: {ing.amount}</li>)}
      </ul>
    </div>
  );
}

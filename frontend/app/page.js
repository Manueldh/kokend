'use client';

import { useState } from 'react';

export default function Home() {
  const [ingredienten, setIngredienten] = useState('');
  const [gerecht, setGerecht] = useState('');
  const [recept, setRecept] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredienten,
          dish: gerecht,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecept(data);
      } else {
        console.error('Error generating recipe');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        🍳 Kokend - Je AI Kook Assistent
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Welke ingrediënten heb je?
            </label>
            <textarea
              value={ingredienten}
              onChange={(e) => setIngredienten(e.target.value)}
              placeholder="Bijvoorbeeld: kip, paprika, rijst, knoflook..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Wat wil je maken?
            </label>
            <input
              type="text"
              value={gerecht}
              onChange={(e) => setGerecht(e.target.value)}
              placeholder="Bijvoorbeeld: curry, pasta, stir-fry..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '🤖 AI denkt na...' : '✨ Genereer Recept'}
          </button>
        </form>
      </div>
      
      {recept && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            📋 Je Recept: {recept.dish}
          </h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-green-700">🥗 Ingrediënten:</h3>
            <ul className="list-disc list-inside space-y-1">
              {recept.ingredients?.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">👨‍🍳 Stappen:</h3>
            <div className="space-y-4">
              {recept.steps?.map((step, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-800">
                      Stap {index + 1}
                    </span>
                    {step.timer && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                        ⏱️ {step.timer}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

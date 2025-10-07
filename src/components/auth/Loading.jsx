import React from 'react';

export function Loading() {
  return (
    <div className="loading" style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontSize: '1.2rem' 
    }}>
      Loading authentication state...
    </div>
  );
}
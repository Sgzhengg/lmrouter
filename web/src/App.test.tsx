import React from 'react'

// 简单测试组件
export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>LMRouter Test Page</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>
        Click Me
      </button>
    </div>
  )
}

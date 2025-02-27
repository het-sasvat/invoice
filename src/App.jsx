import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Invoice from './components/Invoice'
// import InvoiceGenerator from './components/InvoiceGenerator'
// import ACServiceInvoice from './components/ACServiceInvoice'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      {/* < InvoiceGenerator/> */}
      {/* < ACServiceInvoice/> */}
      < Invoice/>
    </>
  )
}

export default App

import { useState } from 'react'

import './App.css'
// import InvoiceGenerator from './components/InvoiceGenerator'
import ACServiceInvoice from './components/ACServiceInvoice'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
  
      < ACServiceInvoice/>

    </>
  )
}

export default App

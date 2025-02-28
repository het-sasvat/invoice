import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import SimpleInvoice from './components/SimpleInvoice'
// import GeneratePdfInvoice from './components/GeneratePdfInvoice'
// import InvoiceGenerator from './components/InvoiceGenerator'
import ACServiceInvoice from './components/ACServiceInvoice'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      {/* < InvoiceGenerator/> */}
      < ACServiceInvoice/>
      {/* < SimpleInvoice/> */}
      {/* < GeneratePdfInvoice/> */}

    </>
  )
}

export default App

import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from "../assets/logo.svg";
import qr from "../assets/qr.png";

const ACServiceInvoice = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '', invoiceDate: '', dueDate: '', gstPercentage: '18'
  });
  
  // Combined field for billing address
  const [billToText, setBillToText] = useState('');
  
  // Combined field for shipping address
  const [shippingAddressText, setShippingAddressText] = useState('');
  
  const [items, setItems] = useState([
    { id: 1, description: '', hsnSac: '', quantity: '', rate: '', taxableValue: '', gst: '', total: '' }
  ]);
  
  const invoiceRef = useRef(null);

  // Calculate values based on quantity and rate
  const calculateItemValues = (qty, rate, gstPercentage) => {
    const taxableValue = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
    const gstRate = parseFloat(gstPercentage) / 100 || 0;
    const gst = taxableValue * gstRate;
    
    return {
      taxableValue: taxableValue.toFixed(2),
      gst: gst.toFixed(2),
      total: (taxableValue + gst).toFixed(2)
    };
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({ ...prev, [name]: value }));
    if (name === 'gstPercentage') {
      // Recalculate all items with new GST
      setItems(items.map(item => ({
        ...item,
        ...calculateItemValues(item.quantity, item.rate, value)
      })));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const { taxableValue, gst, total } = calculateItemValues(
        field === 'quantity' ? value : newItems[index].quantity,
        field === 'rate' ? value : newItems[index].rate,
        invoiceDetails.gstPercentage
      );
      
      newItems[index] = {
        ...newItems[index],
        taxableValue,
        gst,
        total
      };
    }
    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([...items, {
      id: items.length + 1, description: '', hsnSac: '', quantity: '',
      rate: '', taxableValue: '', gst: '', total: ''
    }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.map((item, i) => ({ ...item, id: i + 1 })));
  };

  const calculateTotals = () => {
    const totals = items.reduce((acc, item) => ({
      taxableAmount: acc.taxableAmount + (parseFloat(item.taxableValue) || 0),
      gst: acc.gst + (parseFloat(item.gst) || 0),
      total: acc.total + (parseFloat(item.total) || 0)
    }), { taxableAmount: 0, gst: 0, total: 0 });

    return {
      ...totals,
      cgst: totals.gst / 2,
      sgst: totals.gst / 2
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    
    html2canvas(invoiceRef.current, {
      scale: 2, useCORS: true, logging: false, backgroundColor: '#FFFFFF'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Invoice-${invoiceDetails.invoiceNumber || 'Draft'}.pdf`);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white">
      {/* Toggle and Download Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-4 py-2 rounded ${previewMode ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}
        >
          {previewMode ? 'Edit Invoice' : 'Preview Invoice'}
        </button>
        
        {previewMode && (
          <button onClick={handleDownloadPDF} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Invoice
          </button>
        )}
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef}>
        {/* Header */}
        <div className="flex justify-between mb-8 p-10">
          {/* Left Side */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-72 h-auto mr-4" />
            <div className='ml-9'>
              <h1 className="text-2xl font-bold text-[#1970AC]">Shivkrupa AC Sales & Service</h1>
              <p className="">
                52, 1st Floor, Indrajitbag Co-op. H.Soc.,<br />
                Opp. Diamond Silk Mills, Nikol Road,<br />
                Thakkarbapa Nagar, Ahmedabad, Gujarat, 382350
              </p>
              <p className="mt-2">GSTIN: 24CDDPG6235K1ZM</p>
              <p>Mobile: 8238638933</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="text-right">
            <h2 className="text-xl font-bold mb-4">TAX INVOICE</h2>
            <div className="flex flex-col gap-2">
              {previewMode ? (
                ['invoiceNumber', 'invoiceDate', 'dueDate', 'gstPercentage'].map(field => (
                  <div key={field} className="flex items-center justify-end gap-2">
                    <span className="text-gray-600">
                      {field === 'invoiceNumber' ? 'Invoice #:' : 
                       field === 'invoiceDate' ? 'Date:' : 
                       field === 'dueDate' ? 'Due Date:' : 'GST Rate:'}
                    </span>
                    <span className="font-medium">
                      {field.includes('Date') ? formatDate(invoiceDetails[field]) : 
                       field === 'gstPercentage' ? `${invoiceDetails[field]}%` : 
                       invoiceDetails[field]}
                    </span>
                  </div>
                ))
              ) : (
                ['invoiceNumber', 'invoiceDate', 'dueDate', 'gstPercentage'].map(field => (
                  <div key={field} className="flex items-center justify-end gap-2">
                    <label className="text-gray-600">
                      {field === 'invoiceNumber' ? 'Invoice #:' : 
                       field === 'invoiceDate' ? 'Date:' : 
                       field === 'dueDate' ? 'Due Date:' : 'GST %:'}
                    </label>
                    <input
                      type={field.includes('Date') ? 'date' : field === 'gstPercentage' ? 'number' : 'text'}
                      name={field}
                      value={invoiceDetails[field]}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-32"
                      placeholder={field === 'invoiceNumber' ? 'Enter number' : field === 'gstPercentage' ? 'GST Percentage' : ''}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bill To and Shipping Address */}
        <div className="mb-8 grid grid-cols-2 gap-4 px-5">
          {/* Bill To Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Bill To:</h3>
            {previewMode ? (
              <div className="whitespace-pre-line">{billToText}</div>
            ) : (
              <div>
                <textarea
                  value={billToText}
                  onChange={(e) => setBillToText(e.target.value)}
                  className="border rounded p-2 w-full h-40"
                  placeholder="Enter complete billing information (name, company, address, GSTIN, etc.)"
                />
              </div>
            )}
          </div>

          {/* Shipping Address Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Shipping Address:</h3>
            {previewMode ? (
              <div className="whitespace-pre-line">{shippingAddressText}</div>
            ) : (
              <div>
                <textarea
                  value={shippingAddressText}
                  onChange={(e) => setShippingAddressText(e.target.value)}
                  className="border rounded p-2 w-full h-40"
                  placeholder="Enter complete shipping information (recipient name, company, address, contact person, phone, etc.)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8 overflow-x-auto px-5">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Item Description</th>
                <th className="px-4 py-2 text-left">HSN/SAC</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2 text-right">Taxable Value</th>
                <th className="px-4 py-2 text-right">GST</th>
                <th className="px-4 py-2 text-right">Total</th>
                {!previewMode && <th className="px-4 py-2 text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  {previewMode ? (
                    <>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2">{item.hsnSac}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">₹{parseFloat(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">
                        <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="border rounded px-2 py-1 w-full" placeholder="Enter description" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" value={item.hsnSac} onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                          className="border rounded px-2 py-1 w-24" placeholder="HSN/SAC" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="border rounded px-2 py-1 w-20 text-right" placeholder="Qty" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="border rounded px-2 py-1 w-24 text-right" placeholder="Rate" />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2 text-right">₹{parseFloat(item.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">₹{parseFloat(item.gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">₹{parseFloat(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  {!previewMode && (
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800" disabled={items.length === 1}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!previewMode && (
            <button onClick={addNewItem} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Item
            </button>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8 px-5">
          <div className="w-64">
            {[
              { label: 'Taxable Amount:', value: calculateTotals().taxableAmount },
              { label: `CGST (${parseFloat(invoiceDetails.gstPercentage)/2}%):`, value: calculateTotals().cgst },
              { label: `SGST (${parseFloat(invoiceDetails.gstPercentage)/2}%):`, value: calculateTotals().sgst }
            ].map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <span>{item.label}</span>
                <span>₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Total:</span>
              <span>₹{calculateTotals().total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Bank Details and Contact */}
        <div className="grid grid-cols-3 gap-8 mb-8 px-5">
          <div>
            <img src={qr} alt="Payment QR" className='w-64' />
          </div>
          <div>
            <h3 className="font-bold mb-2">Bank Details:</h3>
            <p>Bank: Axis Bank</p>
            <p>Account No: 921020038865048</p>
            <p>IFSC: UTIB0000664</p>
            <p>Branch: BAPUNAGAR, AHMEDABAD</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Contact:</h3>
            <p>Kishan Gajera</p>
            <p>Email: shivkrupa.ac@gmail.com</p>
            <p>Phone: +91 82386 38933</p>
          </div>
        </div>

        {/* Terms and Signature */}
        <div className="mt-8 text-right px-5">
          <p className="font-bold">For SHIVKRUPA A.C. SALES & SERVICES</p>
          <p className="mt-8 mb-10">Authorized signatory</p>
        </div>
        <div className="text-sm text-gray-600 px-5 pb-5">
          <h3 className="font-bold mb-2">Terms & Conditions:</h3>
          <p>All invoices are payable within 15 days from the invoice date (Net 15). The due date will be clearly mentioned on the invoice.</p>
        </div>
      </div>
    </div>
  );
};

export default ACServiceInvoice;
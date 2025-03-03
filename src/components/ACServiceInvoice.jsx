import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ACServiceInvoice = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '', 
    invoiceDate: '', 
    dueDate: '',
    // gstNumber: '',  // Added GST number field
    // placeOfSupply: '' // State code for GST place of supply
  });
  const [billTo, setBillTo] = useState({
    name: '', 
    companyName: '', 
    address1: '', 
    address2: '', 
    address3: '',
    customerGst: '' // Customer's GST number
  });
  const [shippingAddress, setShippingAddress] = useState({
    name: '', 
    companyName: '', 
    address1: '', 
    address2: '', 
    address3: '', 
    contactPerson: '', 
    phoneNumber: ''
  });
  const [items, setItems] = useState([
    { 
      id: 1, 
      description: '', 
      hsnSac: '', 
      quantity: '', 
      rate: '', 
      gstRate: '18', // Default GST rate
      gstType: 'inclusive', // GST inclusive or exclusive
      cgst: '',
      sgst: '',
      igst: '',
      amount: '' 
    }
  ]);
  
  const invoiceRef = useRef(null);

  // Generic handler for form inputs
  const handleChange = (setter, obj) => (e) => {
    const { name, value } = e.target;
    setter({...obj, [name]: value});
  };

  // Handler for item changes with automatic GST calculation
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const currentItem = {...newItems[index], [field]: value};
    newItems[index] = currentItem;
    
    // Recalculate amount and GST if quantity, rate, or GST-related fields change
    if (['quantity', 'rate', 'gstRate', 'gstType'].includes(field)) {
      const qty = parseFloat(currentItem.quantity) || 0;
      const rate = parseFloat(currentItem.rate) || 0;
      const gstRate = parseFloat(currentItem.gstRate) || 0;
      
      // Calculate base amount and GST
      let baseAmount, totalGst, amount;
      
      if (currentItem.gstType === 'inclusive') {
        // For GST inclusive: Base amount = total / (1 + gstRate/100)
        totalGst = (rate * qty * gstRate) / (100 + gstRate);
        baseAmount = (rate * qty) - totalGst;
        amount = rate * qty;
      } else {
        // For GST exclusive: GST = base amount * (gstRate/100)
        baseAmount = rate * qty;
        totalGst = baseAmount * (gstRate / 100);
        amount = baseAmount + totalGst;
      }
      
      // Determine if IGST or CGST+SGST based on place of supply
      // If place of supply is same as business state, apply CGST+SGST, else IGST
      const isInterState = invoiceDetails.placeOfSupply !== '24'; // Assuming 24 is Gujarat code
      
      let cgst = 0, sgst = 0, igst = 0;
      if (isInterState) {
        igst = totalGst;
      } else {
        cgst = totalGst / 2;
        sgst = totalGst / 2;
      }
      
      newItems[index] = {
        ...currentItem,
        baseAmount: baseAmount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        amount: amount.toFixed(2)
      };
    }
    
    setItems(newItems);
  };

  // Item management functions
  const addNewItem = () => {
    setItems([...items, { 
      id: items.length + 1, 
      description: '', 
      hsnSac: '', 
      quantity: '', 
      rate: '', 
      gstRate: '18', 
      gstType: 'inclusive', 
      cgst: '',
      sgst: '',
      igst: '',
      amount: '' 
    }]);
  };
  
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, id: i + 1 })));
  };
  
  // Calculations and formatting
  const calculateSubtotal = () => items.reduce((total, item) => {
    const baseAmount = parseFloat(item.baseAmount || 0);
    return total + baseAmount;
  }, 0);
  
  const calculateTotalCGST = () => items.reduce((total, item) => total + parseFloat(item.cgst || 0), 0);
  const calculateTotalSGST = () => items.reduce((total, item) => total + parseFloat(item.sgst || 0), 0);
  const calculateTotalIGST = () => items.reduce((total, item) => total + parseFloat(item.igst || 0), 0);
  const calculateTotal = () => items.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
  
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const formatCurrency = (value) => parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    
    html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Invoice-${invoiceDetails.invoiceNumber || 'Draft'}.pdf`);
    });
  };

  // Reusable components
  const AddressDisplay = ({ data }) => (
    <div>
      <p className="font-medium">{data.name}</p>
      {data.companyName && <p>{data.companyName}</p>}
      {data.customerGst && <p><span className="text-gray-600">GSTIN:</span> {data.customerGst}</p>}
      {data.address1 && <p>{data.address1}</p>}
      {data.address2 && <p>{data.address2}</p>}
      {data.address3 && <p>{data.address3}</p>}
      {data.contactPerson && <p><span className="text-gray-600">Contact Person:</span> {data.contactPerson}</p>}
      {data.phoneNumber && <p><span className="text-gray-600">Phone:</span> {data.phoneNumber}</p>}
    </div>
  );

  const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border rounded px-2 py-1 w-full"
        placeholder={placeholder}
      />
    </div>
  );

  // Address field configurations
  const billToFields = [
    { name: 'name', label: 'Customer Name', placeholder: 'Customer Name' },
    { name: 'companyName', label: 'Company Name', placeholder: 'Company Name' },
    { name: 'customerGst', label: 'GSTIN', placeholder: 'Customer GSTIN' },
    { name: 'address1', label: 'Address Line 1', placeholder: 'Address Line 1' },
    { name: 'address2', label: 'Address Line 2', placeholder: 'Address Line 2' },
    { name: 'address3', label: 'Address Line 3', placeholder: 'City, State, Pincode' }
  ];

  const shippingFields = [
    { name: 'name', label: 'Recipient Name', placeholder: 'Recipient Name' },
    { name: 'companyName', label: 'Company Name', placeholder: 'Company Name' },
    { name: 'address1', label: 'Address Line 1', placeholder: 'Address Line 1' },
    { name: 'address2', label: 'Address Line 2', placeholder: 'Address Line 2' },
    { name: 'address3', label: 'Address Line 3', placeholder: 'City, State, Pincode' },
    { name: 'contactPerson', label: 'Contact Person', placeholder: 'Contact Person' },
    { name: 'phoneNumber', label: 'Phone Number', placeholder: 'Phone Number' }
  ];

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
          {/* Company Info */}
          <div className="flex items-center">
            <img src="src\assets\logo.svg" alt="Logo" className="w-72 h-auto mr-4" />
            <div className="ml-9">
              <h1 className="text-2xl font-bold text-[#1970AC]">Shivkrupa AC Sales & Service</h1>
              <p>
                52, 1st Floor, Indrajitbag Co-op. H.Soc.,<br />
                Opp. Diamond Silk Mills, Nikol Road,<br />
                Thakkarbapa Nagar, Ahmedabad, Gujarat, 382350
              </p>
              <p>Mobile: 8238638933</p>
              {previewMode ? (
                <p><span className="font-medium">GSTIN:</span> {invoiceDetails.gstNumber}</p>
              ) : null}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="text-right">
            <h2 className="text-xl font-bold mb-4">TAX INVOICE</h2> {/* Changed to TAX INVOICE */}
            {previewMode ? (
              <div className="flex flex-col gap-2">
                <div><span className="text-gray-600">Invoice #:</span> <span className="font-medium">{invoiceDetails.invoiceNumber}</span></div>
                <div><span className="text-gray-600">Date:</span> <span className="font-medium">{formatDate(invoiceDetails.invoiceDate)}</span></div>
                <div><span className="text-gray-600">Due Date:</span> <span className="font-medium">{formatDate(invoiceDetails.dueDate)}</span></div>
                {/* <div><span className="text-gray-600">Place of Supply:</span> <span className="font-medium">{invoiceDetails.placeOfSupply}</span></div> */}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {[
                  { field: 'invoiceNumber', label: 'Invoice #:', type: 'text' },
                  { field: 'invoiceDate', label: 'Date:', type: 'date' },
                  { field: 'dueDate', label: 'Due Date:', type: 'date' },
                  { field: 'gstNumber', label: 'GSTIN:', type: 'text' },
                  { field: 'placeOfSupply', label: 'Place of Supply:', type: 'text', placeholder: 'State Code (e.g. 24 for Gujarat)' }
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field} className="flex items-center justify-end gap-2">
                    <label className="text-gray-600">{label}</label>
                    <input
                      type={type}
                      name={field}
                      value={invoiceDetails[field]}
                      onChange={handleChange(setInvoiceDetails, invoiceDetails)}
                      className="border rounded px-2 py-1 w-40"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bill To and Shipping Address Section */}
        <div className="mb-8 grid grid-cols-2 gap-4 px-5">
          {/* Bill To Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Bill To:</h3>
            {previewMode ? (
              <AddressDisplay data={billTo} />
            ) : (
              <div className="space-y-2">
                {billToFields.map(field => (
                  <InputField
                    key={field.name}
                    {...field}
                    value={billTo[field.name]}
                    onChange={handleChange(setBillTo, billTo)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shipping Address Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Shipping Address:</h3>
            {previewMode ? (
              <AddressDisplay data={shippingAddress} />
            ) : (
              <div className="space-y-2">
                {shippingFields.map(field => (
                  <InputField
                    key={field.name}
                    {...field}
                    value={shippingAddress[field.name]}
                    onChange={handleChange(setShippingAddress, shippingAddress)}
                  />
                ))}
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
                {previewMode && (
                  <>
                    <th className="px-4 py-2 text-right">Taxable</th>
                    <th className="px-4 py-2 text-right">GST</th>
                  </>
                )}
                {!previewMode && (
                  <>
                    <th className="px-4 py-2 text-center">GST %</th>
                    <th className="px-4 py-2 text-center">Type</th>
                  </>
                )}
                <th className="px-4 py-2 text-right">Amount</th>
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
                      <td className="px-4 py-2 text-right">₹{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-2 text-right">₹{formatCurrency(item.baseAmount)}</td>
                      <td className="px-4 py-2 text-right">
                        {parseFloat(item.cgst) > 0 ? (
                          <>CGST: ₹{formatCurrency(item.cgst)}<br />SGST: ₹{formatCurrency(item.sgst)}</>
                        ) : (
                          <>IGST: ₹{formatCurrency(item.igst)}</>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="border rounded px-2 py-1 w-full" 
                          placeholder="Enter description" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={item.hsnSac} 
                          onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                          className="border rounded px-2 py-1 w-24" 
                          placeholder="HSN/SAC" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="border rounded px-2 py-1 w-20 text-right" 
                          placeholder="Qty" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={item.rate} 
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="border rounded px-2 py-1 w-24 text-right" 
                          placeholder="Rate" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                          className="border rounded px-2 py-1 w-20"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.gstType}
                          onChange={(e) => handleItemChange(index, 'gstType', e.target.value)}
                          className="border rounded px-2 py-1 w-28"
                        >
                          <option value="inclusive">Inclusive</option>
                          <option value="exclusive">Exclusive</option>
                        </select>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2 text-right">₹{formatCurrency(item.amount)}</td>
                  {!previewMode && (
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => removeItem(index)} 
                        className="text-red-600 hover:text-red-800"
                        disabled={items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!previewMode && (
            <button 
              onClick={addNewItem} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8 px-5">
          <div className="w-72">
            <div className="flex justify-between py-2 border-t">
              <span>Subtotal:</span>
              <span>₹{formatCurrency(calculateSubtotal())}</span>
            </div>
            
            {calculateTotalCGST() > 0 && (
              <>
                <div className="flex justify-between py-2">
                  <span>CGST:</span>
                  <span>₹{formatCurrency(calculateTotalCGST())}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>SGST:</span>
                  <span>₹{formatCurrency(calculateTotalSGST())}</span>
                </div>
              </>
            )}
            
            {calculateTotalIGST() > 0 && (
              <div className="flex justify-between py-2">
                <span>IGST:</span>
                <span>₹{formatCurrency(calculateTotalIGST())}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 font-bold border-t mt-2">
              <span>Total Amount:</span>
              <span>₹{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Bank Details and Contact */}
        <div className="grid grid-cols-2 gap-8 mb-8 px-5">
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

        {/* Invoice notes */}
        {/* <div className="px-5 mb-8 text-sm">
          <h3 className="font-bold mb-2">GST Notes:</h3>
          <div className="border-t pt-2">
            <p>• E. & O.E. Invoice is subject to Gujarat jurisdiction.</p>
            <p>• GST Reg No: {invoiceDetails.gstNumber}</p>
            <p>• This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div> */}

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
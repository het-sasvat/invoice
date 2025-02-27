import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ACServiceInvoice = () => {
  const invoiceRef = useRef(null);
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
  });

  const [billTo, setBillTo] = useState({
    name: "",
    companyName: "",
    address1: "",
    address2: "",
    address3: "",
    gstin: "",
    placeOfSupply: "",
  });

  const [shipTo, setShipTo] = useState({
    name: "",
    companyName: "",
    address1: "",
    address2: "",
    address3: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      description: "",
      hsnSac: "",
      quantity: "",
      rate: "",
      taxableValue: "",
      gst: "",
      total: "",
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillToChange = (e) => {
    const { name, value } = e.target;
    setBillTo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShipToChange = (e) => {
    const { name, value } = e.target;
    setShipTo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate taxable value and total
    if (field === "quantity" || field === "rate") {
      const qty =
        parseFloat(field === "quantity" ? value : newItems[index].quantity) ||
        0;
      const rate =
        parseFloat(field === "rate" ? value : newItems[index].rate) || 0;
      const taxableValue = qty * rate;
      const gst = taxableValue * 0.18; // Assuming 18% GST
      const total = taxableValue + gst;

      newItems[index] = {
        ...newItems[index],
        taxableValue: taxableValue.toFixed(2),
        gst: gst.toFixed(2),
        total: total.toFixed(2),
      };
    }

    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        description: "",
        hsnSac: "",
        quantity: "",
        rate: "",
        taxableValue: "",
        gst: "",
        total: "",
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    // Update IDs for remaining items
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      id: i + 1,
    }));
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const totals = items.reduce(
      (acc, item) => {
        return {
          taxableAmount:
            acc.taxableAmount + (parseFloat(item.taxableValue) || 0),
          gst: acc.gst + (parseFloat(item.gst) || 0),
          total: acc.total + (parseFloat(item.total) || 0),
        };
      },
      { taxableAmount: 0, gst: 0, total: 0 }
    );

    return {
      ...totals,
      cgst: totals.gst / 2,
      sgst: totals.gst / 2,
    };
  };

  // New Download Function
  const handleDownloadPdf = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Initialize the PDF - A4 format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Generate filename with invoice number or date
    const fileName = `Invoice_${invoiceDetails.invoiceNumber || 'Draft'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Download Button - Positioned at the top */}
      <div className="w-full max-w-6xl flex justify-end mb-4">
        <button
          onClick={handleDownloadPdf}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Invoice
        </button>
      </div>
      
      {/* Invoice Content - Wrapped in a div with ref for PDF generation */}
      <div ref={invoiceRef} className="max-w-6xl mx-auto p-8 bg-white shadow-md rounded-lg">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-80 h-auto flex-shrink-0">
              <img
                src="https://shivkrupaacservice.byvolt.in/static/media/logo%20black.b4392fc60254080c5224.png"
                alt="Shivkrupa AC Logo"
                className="w-80 h-auto object-contain"
              />
            </div>

            {/* Company Info */}
            <div>
              <h1 className="text-2xl font-bold text-[#1970AC]">Shivkrupa AC Sales & Service</h1>
              <p className=""><b>Address: </b>
                52, 1st Floor, Indrajitbag Co-op. H.Soc.,
                <br />
                Opp. Diamond Silk Mills, Nikol Road,
                <br />
                Thakkarbapa Nagar, Ahmedabad, Gujarat, 382350
              </p>
              <p className="mt-2"><b>GSTIN:</b> 24CDDPG6235K1ZM</p>
              <p><b>Mobile: </b>8238638933</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold mb-4">TAX INVOICE</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-end gap-2">
                <label className="text-gray-600">Invoice #:</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceDetails.invoiceNumber}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-32"
                  placeholder="Enter number"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <label className="text-gray-600">Date:</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={invoiceDetails.invoiceDate}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-32"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <label className="text-gray-600">Due Date:</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoiceDetails.dueDate}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill To and Ship To Sections */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Bill To Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Bill To:</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={billTo.name}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={billTo.companyName}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address1"
                  value={billTo.address1}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Address Line 1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={billTo.address2}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Address Line 2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 3
                </label>
                <input
                  type="text"
                  name="address3"
                  value={billTo.address3}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="City, State, Pincode"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={billTo.gstin}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="GSTIN"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Place of Supply
                </label>
                <input
                  type="text"
                  name="placeOfSupply"
                  value={billTo.placeOfSupply}
                  onChange={handleBillToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Place of Supply"
                />
              </div>
            </div>
          </div>

          {/* Ship To Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Ship To:</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={shipTo.name}
                  onChange={handleShipToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={shipTo.companyName}
                  onChange={handleShipToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address1"
                  value={shipTo.address1}
                  onChange={handleShipToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Address Line 1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={shipTo.address2}
                  onChange={handleShipToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Address Line 2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Address Line 3
                </label>
                <input
                  type="text"
                  name="address3"
                  value={shipTo.address3}
                  onChange={handleShipToChange}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="City, State, Pincode"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8 overflow-x-auto">
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
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Enter description"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.hsnSac}
                      onChange={(e) =>
                        handleItemChange(index, "hsnSac", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-24"
                      placeholder="HSN/SAC"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-20 text-right"
                      placeholder="Qty"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-24 text-right"
                      placeholder="Rate"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    ₹
                    {parseFloat(item.taxableValue || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ₹
                    {parseFloat(item.gst || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ₹
                    {parseFloat(item.total || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addNewItem}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Taxable Amount:</span>
              <span>
                ₹
                {calculateTotals().taxableAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>CGST:</span>
              <span>
                ₹
                {calculateTotals().cgst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>SGST:</span>
              <span>
                ₹
                {calculateTotals().sgst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Total:</span>
              <span>
                ₹
                {calculateTotals().total.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
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

        {/* Terms */}
        <div className="text-sm text-gray-600">
          <h3 className="font-bold mb-2">Terms & Conditions:</h3>
          <p>
            All invoices are payable within 15 days from the invoice date (Net
            15). The due date will be clearly mentioned on the invoice.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 text-right">
          <p className="font-bold">For SHIVKRUPA A.C. SALES & SERVICES</p>
          <p className="mt-8">Authorized signatory</p>
        </div>
      </div>
    </div>
  );
};

export default ACServiceInvoice;
  

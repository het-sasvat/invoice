import React, { useState } from "react";
import { Button } from "@/components/ui/button"; 

const InvoiceGenerator = () => {
  const [invoice, setInvoice] = useState({
    invoiceNo: "",
    invoiceDate: "",
    dueDate: "",
    customer: {
      name: "",
      billingAddress: "",
      shippingAddress: "",
      gst: "",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "",
      placeOfSupply: "24-GUJARAT",
    },
    items: [],
  });

  const [newItem, setNewItem] = useState({
    item: "",
    rate: 0,
    qty: 0,
    sac: "",
    gst: 0,
  });

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, newItem] });
    setNewItem({ item: "", rate: 0, qty: 0, sac: "", gst: 0 });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg border rounded-lg">
      <div className="p-6 border-b flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">Shivkrupa AC</h1>
            <p className="text-gray-600">Sales & Service</p>
          </div>
        </div>
        <div className="text-right">
          <p>GSTIN: 24CDDP6235K1ZM</p>
          <p>Ahmedabad, Gujarat</p>
          <input type="text" placeholder="Invoice No" className="border p-2 w-full mb-2" value={invoice.invoiceNo} onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })} />
          <input type="date" className="border p-2 w-full mb-2" value={invoice.invoiceDate} onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })} />
          <input type="date" className="border p-2 w-full mb-2" value={invoice.dueDate} onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })} />
        </div>
      </div>

      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
        <input type="text" placeholder="Customer Name" className="border p-2 w-full mb-2" value={invoice.customer.name} onChange={(e) => setInvoice({ ...invoice, customer: { ...invoice.customer, name: e.target.value } })} />
        <input type="text" placeholder="Billing Address" className="border p-2 w-full mb-2" value={invoice.customer.billingAddress} onChange={(e) => setInvoice({ ...invoice, customer: { ...invoice.customer, billingAddress: e.target.value } })} />
        <input type="text" placeholder="Shipping Address" className="border p-2 w-full mb-2" value={invoice.customer.shippingAddress} onChange={(e) => setInvoice({ ...invoice, customer: { ...invoice.customer, shippingAddress: e.target.value } })} />
      </div>

      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-2">Add Item</h2>
        <input type="text" placeholder="Item Name" className="border p-2 w-full mb-2" value={newItem.item} onChange={(e) => setNewItem({ ...newItem, item: e.target.value })} />
        <input type="number" placeholder="Rate" className="border p-2 w-full mb-2" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) })} />
        <input type="number" placeholder="Qty" className="border p-2 w-full mb-2" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) })} />
        <Button className="bg-green-500 text-white p-2 mt-2" onClick={addItem}>Add Item</Button>
      </div>

      <div className="p-6 border-b text-center">
        <Button className="bg-blue-600 text-white p-3">Generate PDF</Button>
      </div>

      <div className="p-6 border-t text-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold mb-2">Bank Details</h2>
          <p>Bank: Axis Bank</p>
          <p>Account No: 921020038865048</p>
          <p>IFSC: UTIB0000664</p>
          <p>Branch: Bapunagar, Ahmedabad</p>
        </div>
        <div className="text-right">
          <p className="mt-4">For SHIVKRUPA A.C. SALES & SERVICES</p>
          <p className="mt-2 font-semibold">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerator;
